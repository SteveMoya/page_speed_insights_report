const https = require('https');
const fs = require('fs');
const path = require('path');

// --- Configuración ---
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    try {
        const envFile = fs.readFileSync(envPath, 'utf-8');
        envFile.split(/\r?\n/).forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim();
            }
        });
        console.log('Variables de entorno cargadas desde .env');
    } catch (err) {
        console.warn('Advertencia: Archivo .env no encontrado o no se pudo leer.');
    }
}

loadEnv();

const PAGE_SPEED_INSIGHTS_API_KEY = process.env.PAGE_SPEED_INSIGHTS_API_KEY;
if (!PAGE_SPEED_INSIGHTS_API_KEY) {
    console.error('Error: La variable de entorno PAGE_SPEED_INSIGHTS_API_KEY no está definida.');
    process.exit(1);
}

const inputFilePath = path.join(__dirname, 'urls.csv');
const outputFilePath = path.join(__dirname, 'resultados_pagespeed.csv');

// --- Funciones de Lógica ---
async function getPageSpeedData(url) {
    return new Promise((resolve, reject) => {
        const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGE_SPEED_INSIGHTS_API_KEY}`;

        https.get(apiEndpoint, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    const performanceScore = result.lighthouseResult?.categories?.performance?.score;
                    resolve(performanceScore !== undefined ? Math.round(performanceScore * 100) : null);
                } catch (error) {
                    console.error(`Error al analizar la respuesta JSON para ${url}: ${error.message}`);
                    resolve(null);
                }
            });
        }).on('error', (error) => {
            console.error(`Error en la petición para ${url}: ${error.message}`);
            resolve(null);
        });
    });
}

function readUrlsFromCsv(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
    } catch (error) {
        console.error(`Error al leer el archivo CSV: ${error.message}`);
        return [];
    }
}

function writeResultsToCsv(results, filePath) {
    let csvContent = 'Pagina,Puntaje_PageSpeed\n';
    results.forEach(result => {
        csvContent += `${result.url},${result.score !== null ? result.score : 'Error'}\n`;
    });
    try {
        fs.writeFileSync(filePath, csvContent, 'utf-8');
        console.log(`\nArchivo CSV generado con éxito en: ${filePath}`);
    } catch (error) {
        console.error(`Error al escribir el archivo CSV: ${error.message}`);
    }
}

// --- Lógica Principal con Paralelismo ---
async function runPageSpeedTests() {
    const urls = readUrlsFromCsv(inputFilePath);

    if (urls.length === 0) {
        console.log('No se encontraron URLs en el archivo o el archivo no existe.');
        return;
    }

    const concurrencyLimit = 5; // Limita a 5 peticiones simultáneas
    console.log(`Iniciando tests para ${urls.length} URLs con ${concurrencyLimit} peticiones simultáneas...`);

    const results = [];
    const batches = [];
    for (let i = 0; i < urls.length; i += concurrencyLimit) {
        batches.push(urls.slice(i, i + concurrencyLimit));
    }

    for (const batch of batches) {
        const promises = batch.map(url => {
            const processedUrl = url.startsWith('https://') || url.startsWith('http://')
                ? url
                : `https://${url}`;

            return getPageSpeedData(processedUrl)
                .then(score => {
                    console.log(`  Puntaje de Performance para ${url}: ${score !== null ? score : 'Error'}`);
                    return { url, score };
                });
        });

        // Espera a que todas las promesas del batch se resuelvan
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
    }

    writeResultsToCsv(results, outputFilePath);
    console.log('\nTodos los tests han finalizado.');
}

runPageSpeedTests();