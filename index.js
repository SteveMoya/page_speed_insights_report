const https = require('https');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CONFIGURACIÓN Y UTILIDADES COMPARTIDAS
// ==========================================

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    try {
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf-8');
            envFile.split(/\r?\n/).forEach(line => {
                const parts = line.split('=');
                if (parts.length === 2) {
                    process.env[parts[0].trim()] = parts[1].trim();
                }
            });
            console.log('✅ Variables de entorno cargadas.');
        } else {
            console.warn('⚠️ No se encontró el archivo .env');
        }
    } catch (err) { console.warn(`⚠️ Error leyendo .env: ${err.message}`); }
}

loadEnv();

const PAGE_SPEED_INSIGHTS_API_KEY = process.env.PAGE_SPEED_INSIGHTS_API_KEY;
const INPUT_CSV_PATH = path.join(__dirname, 'urls.csv');

// Validación de API Key
if (!PAGE_SPEED_INSIGHTS_API_KEY) {
    console.error('❌ Error: Falta PAGE_SPEED_INSIGHTS_API_KEY en .env');
    process.exit(1);
}

/**
 * Función compartida para consultar PageSpeed API
 * Retorna un objeto { url, score, error }
 */
async function getPageSpeedData(url) {
    return new Promise((resolve) => {
        const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGE_SPEED_INSIGHTS_API_KEY}&strategy=mobile`;

        https.get(apiEndpoint, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    // Intenta parsear el error para dar más detalles si es posible
                    resolve({ url, score: null, error: `Status ${res.statusCode}` });
                    return;
                }
                try {
                    const json = JSON.parse(data);
                    const score = json.lighthouseResult?.categories?.performance?.score;
                    resolve({ 
                        url, 
                        score: score !== undefined ? Math.round(score * 100) : null, 
                        error: null 
                    });
                } catch (e) { resolve({ url, score: null, error: 'JSON Error' }); }
            });
        }).on('error', (err) => resolve({ url, score: null, error: err.message }));
    });
}

/**
 * Lee el archivo CSV y devuelve un array de líneas limpias
 */
function readCsvLines() {
    try {
        if (fs.existsSync(INPUT_CSV_PATH)) {
            return fs.readFileSync(INPUT_CSV_PATH, 'utf-8')
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l && !l.includes(' ')); // Filtra líneas vacías o con espacios internos
        }
    } catch (e) { console.error('Error leyendo urls.csv'); return []; }
    return [];
}

// ==========================================
// 2. MODO A: DIRECTO (Lista de URLs -> Reporte Único)
// ==========================================

async function runDirectMode() {
    console.log(`\n🚀 MODO DIRECTO: Leyendo URLs exactas de urls.csv...`);
    const outputFilePath = path.join(__dirname, 'resultados_pagespeed_directo.csv');
    
    // Leemos el CSV
    let rawUrls = readCsvLines();
    if (rawUrls.length === 0) {
        console.log('❌ No se encontraron URLs en el archivo.');
        return;
    }

    // Aseguramos que tengan protocolo
    const urls = rawUrls.map(url => 
        (url.startsWith('https://') || url.startsWith('http://')) ? url : `https://${url}`
    );

    const concurrencyLimit = 15;
    console.log(`📋 Procesando ${urls.length} URLs con concurrencia de ${concurrencyLimit}...`);

    const results = [];
    const batches = [];
    for (let i = 0; i < urls.length; i += concurrencyLimit) {
        batches.push(urls.slice(i, i + concurrencyLimit));
    }

    let count = 0;
    for (const batch of batches) {
        const promises = batch.map(url => getPageSpeedData(url).then(res => {
            count++;
            const logScore = res.score !== null ? res.score : 'ERR';
            process.stdout.write(`\r   ⏳ [${count}/${urls.length}] ${res.url.slice(0, 30)}... -> Score: ${logScore}  `);
            return res;
        }));

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
    }
    console.log("\n");

    // Escribir resultados
    let csvContent = 'Pagina,Puntaje_PageSpeed,Error\n';
    results.forEach(r => {
        csvContent += `${r.url},${r.score !== null ? r.score : 'N/A'},${r.error || ''}\n`;
    });

    try {
        fs.writeFileSync(outputFilePath, csvContent, 'utf-8');
        console.log(`✅ Archivo generado: ${outputFilePath}`);
    } catch (error) {
        console.error(`Error escribiendo CSV: ${error.message}`);
    }
}

// ==========================================
// 3. MODO B: CRAWLER (Dominio -> Sitemap -> Reportes por Dominio)
// ==========================================

const LOC_REGEX = /<loc>(.*?)<\/loc>/g;
const OUTPUT_DIR_CRAWLER = path.join(__dirname, 'resultados_por_dominio');

// --- Funciones auxiliares del Crawler ---

async function findSitemapFromRobots(rawDomain) {
    let baseUrl = rawDomain.trim();
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    console.log(`\n🔍 Analizando dominio: ${baseUrl}`);

    // Intento 1: Robots.txt
    const robotsUrl = `${baseUrl}/robots.txt`;
    try {
        const response = await fetch(robotsUrl);
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.trim().toLowerCase().startsWith('sitemap:')) {
                    const match = line.match(/^sitemap:\s*(.+)$/i);
                    if (match && match[1]) return match[1].trim();
                }
            }
        }
    } catch (e) { /* Silencioso */ }

    // Fallbacks comunes
    const fallbacks = [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap_index.xml`];
    for (const url of fallbacks) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) {
                console.log(`   ✓ Encontrado sitemap por defecto: ${url}`);
                return url;
            }
        } catch (e) {}
    }
    return null;
}

function parseSitemapContent(xmlText) {
    const pageUrls = [];
    const sitemapIndexUrls = [];
    let match;
    while ((match = LOC_REGEX.exec(xmlText)) !== null) {
        let url = match[1].trim()
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        
        if (url.endsWith('.xml') || url.endsWith('.xml.gz')) {
            sitemapIndexUrls.push(url);
        } else {
            pageUrls.push(url);
        }
    }
    return { pageUrls, sitemapIndexUrls };
}

async function extractUrlsFromSitemap(initialSitemapUrl) {
    const finalPageUrls = new Set();
    const sitemapsToProcess = [initialSitemapUrl];
    const processedSitemaps = new Set();

    while (sitemapsToProcess.length > 0) {
        const currentSitemap = sitemapsToProcess.shift();
        if (processedSitemaps.has(currentSitemap)) continue;
        processedSitemaps.add(currentSitemap);

        // Logging visual
        const isIndex = currentSitemap.includes('index') || currentSitemap === initialSitemapUrl;
        if (!isIndex) console.log(`      ↳ 📄 Leyendo sub-sitemap: ${path.basename(currentSitemap)}`);

        try {
            const res = await fetch(currentSitemap);
            if (!res.ok) continue;
            const xml = await res.text();
            const { pageUrls, sitemapIndexUrls } = parseSitemapContent(xml);

            pageUrls.forEach(u => finalPageUrls.add(u));
            sitemapIndexUrls.forEach(u => {
                if (!processedSitemaps.has(u)) sitemapsToProcess.push(u);
            });
        } catch (e) { console.error(`      ❌ Error XML: ${e.message}`); }
    }
    return Array.from(finalPageUrls);
}

async function analyzeUrlsBatch(urls) {
    const results = [];
    const concurrencyLimit = 5; 
    const batches = [];
    
    for (let i = 0; i < urls.length; i += concurrencyLimit) {
        batches.push(urls.slice(i, i + concurrencyLimit));
    }

    let count = 0;
    for (const batch of batches) {
        const promises = batch.map(url => getPageSpeedData(url).then(res => {
            count++;
            const icon = (res.score >= 90) ? '🟢' : (res.score >= 50 ? '🟠' : (res.score !== null ? '🔴' : '⚪'));
            const logScore = res.score !== null ? res.score : 'ERR';
            process.stdout.write(`\r   ⏳ [${count}/${urls.length}] ${icon} ${logScore} - ${url.slice(0, 30)}... `);
            return res;
        }));
        results.push(...await Promise.all(promises));
    }
    console.log(""); 
    return results;
}

async function runCrawlerMode() {
    console.log(`\n🕷️  MODO CRAWLER: Buscando Sitemaps y analizando todo el sitio...`);
    
    if (!fs.existsSync(OUTPUT_DIR_CRAWLER)) fs.mkdirSync(OUTPUT_DIR_CRAWLER);
    
    const domains = readCsvLines();
    if (domains.length === 0) {
        console.log('❌ No hay dominios en urls.csv');
        return;
    }

    for (const domain of domains) {
        const sitemapUrl = await findSitemapFromRobots(domain);
        
        if (!sitemapUrl) {
            console.log(`❌ Saltando ${domain} (No se encontró sitemap).`);
            continue;
        }

        console.log(`   🕷️  Extrayendo URLs...`);
        const urls = await extractUrlsFromSitemap(sitemapUrl);
        
        if (urls.length === 0) {
            console.log(`   ⚠️ Sitemap vacío.`);
            continue;
        }
        console.log(`   ✅ Total URLs encontradas: ${urls.length}`);
        console.log(`   🚀 Analizando rendimiento...`);
        
        const results = await analyzeUrlsBatch(urls);

        // Guardar CSV por dominio
        const safeName = domain.replace(/[^a-z0-9\.-]/gi, '_'); 
        const fileName = path.join(OUTPUT_DIR_CRAWLER, `${safeName}.csv`);
        
        let csvContent = 'URL,Puntaje_PageSpeed,Estado\n';
        results.sort((a, b) => (a.score || 0) - (b.score || 0));
        results.forEach(r => {
            csvContent += `${r.url},${r.score !== null ? r.score : 'N/A'},${r.error || 'OK'}\n`;
        });

        fs.writeFileSync(fileName, csvContent, 'utf-8');
        console.log(`   💾 Guardado: ${fileName}`);
    }
}

// ==========================================
// 4. CONTROLADOR PRINCIPAL (MAIN SWITCH)
// ==========================================

const mode = process.argv[2]; // Obtiene el argumento de la línea de comandos

console.log(`\n========================================`);
console.log(`   PAGE SPEED MULTI-TOOL `);
console.log(`========================================`);

if (mode === 'direct') {
    runDirectMode();
} else if (mode === 'crawler' || mode === 'sitemap') {
    runCrawlerMode();
} else {
    console.log(`⚠️  Argumento no reconocido o faltante.`);
    console.log(`\nUso:`);
    console.log(`  node script.js direct    -> Lee URLs exactas de urls.csv y genera un solo reporte.`);
    console.log(`  node script.js crawler   -> Lee dominios de urls.csv, busca sitemaps y genera reportes por dominio.`);
    console.log(`\nEjemplo: node app.js direct`);
}