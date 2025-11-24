# PageSpeed Insights Report Generator
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/27db6ec9-aff1-4849-92a7-696b137808a4" />

Una herramienta Node.js para analizar en lote el rendimiento de sitios web utilizando la API de Google PageSpeed Insights.

## 📋 Descripción

Esta herramienta analiza automáticamente múltiples sitios web usando la API de Google PageSpeed Insights y genera un reporte CSV con los puntajes de rendimiento. Es perfecta para monitorear el rendimiento de múltiples sitios web simultáneamente.

## ⚙️ Requisitos Previos

- Node.js instalado (versión 14 o superior)
- Clave API de Google PageSpeed Insights ([Obtener aquí](https://developers.google.com/speed/docs/insights/v5/get-started))

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/SteveMoya/page_speed_insights_report.git
cd page_speed_insights_report
```

2. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto
   - Agrega tu clave API de PageSpeed Insights:
```env
PAGE_SPEED_INSIGHTS_API_KEY=tu_clave_api_aqui
```

## 📝 Uso

El script ofrece **dos modos de ejecución** según tus necesidades:

### 🎯 Modo 1: DIRECTO (Direct Mode)

Analiza URLs específicas que proporcionas en el archivo CSV.

**1. Prepara el archivo de entrada:**

Agrega tus URLs al archivo `urls.csv`, una por línea (sin encabezados):
```
example.com
another-site.com/specific-page
https://mywebsite.com/landing
```

**2. Ejecuta el script en modo directo:**
```bash
node index.js direct
```

**3. Revisa los resultados:**

El script genera un archivo `resultados_pagespeed_directo.csv` con tres columnas:
- `Pagina`: URL analizada
- `Puntaje_PageSpeed`: Score de 0-100 o N/A
- `Error`: Mensaje de error si falló

**Características del modo directo:**
- ✅ Analiza solo las URLs exactas que especifiques
- ✅ Procesa 15 URLs simultáneamente
- ✅ Un solo archivo de salida consolidado
- ✅ Ideal para: análisis puntuales, páginas específicas, comparaciones

---

### 🕷️ Modo 2: CRAWLER (Sitemap Mode)

Descubre automáticamente todas las URLs de un sitio mediante su sitemap.

**1. Prepara el archivo de entrada:**

Agrega los dominios (sin rutas específicas) al archivo `urls.csv`:
```
example.com
mywebsite.com
anothersite.org
```

**2. Ejecuta el script en modo crawler:**
```bash
node index.js crawler
```
O también:
```bash
node index.js sitemap
```

**3. Revisa los resultados:**

El script crea una carpeta `resultados_por_dominio/` con un archivo CSV por cada dominio:
- `example_com.csv`
- `mywebsite_com.csv`
- `anothersite_org.csv`

Cada CSV contiene:
- `URL`: Página encontrada en el sitemap
- `Puntaje_PageSpeed`: Score de 0-100 o N/A
- `Estado`: OK o mensaje de error

**Características del modo crawler:**
- ✅ Busca automáticamente el sitemap en `/robots.txt`, `/sitemap.xml`, `/sitemap_index.xml`
- ✅ Procesa sitemaps anidados (sitemap index)
- ✅ Genera reportes separados por dominio
- ✅ Procesa 5 URLs simultáneamente por dominio
- ✅ Resultados ordenados por score (peor a mejor)
- ✅ Ideal para: auditorías completas, análisis de sitios enteros

---

### 📊 Comparación de Modos

| Característica | Modo Direct | Modo Crawler |
|---------------|-------------|--------------|
| **Entrada** | URLs específicas | Dominios |
| **Descubrimiento** | Manual | Automático (sitemap) |
| **Concurrencia** | 15 URLs | 5 URLs |
| **Salida** | 1 archivo CSV | 1 CSV por dominio |
| **Uso ideal** | Páginas puntuales | Sitios completos |

---

### ⚠️ Nota: Comando sin parámetros

Si ejecutas el script sin especificar el modo:
```bash
node index.js
```

Se mostrará un mensaje de ayuda con las opciones disponibles.

## 📊 Salida

### Modo Directo
El script genera un archivo `resultados_pagespeed_directo.csv` con tres columnas:
- `Pagina`: La URL analizada
- `Puntaje_PageSpeed`: Puntaje de rendimiento (0-100) o "N/A" si el análisis falló
- `Error`: Mensaje de error o vacío si fue exitoso

**Ejemplo de salida (modo directo):**
```csv
Pagina,Puntaje_PageSpeed,Error
https://example.com,85,
https://mysite.com/page,92,
https://broken-site.com,N/A,Status 404
```

### Modo Crawler
El script crea una carpeta `resultados_por_dominio/` con un archivo CSV por cada dominio analizado:

**Estructura de carpetas:**
```
resultados_por_dominio/
├── example_com.csv
├── mywebsite_com.csv
└── anothersite_org.csv
```

**Ejemplo de salida (modo crawler):**
```csv
URL,Puntaje_PageSpeed,Estado
https://example.com/page1,45,OK
https://example.com/page2,78,OK
https://example.com/page3,95,OK
```

Los resultados están ordenados de menor a mayor score para identificar fácilmente las páginas que necesitan optimización.

## ⚡ Características

- **Dos modos de operación**: Directo (URLs específicas) y Crawler (sitios completos)
- **Análisis en lote** de múltiples URLs
- **Procesamiento paralelo**: 15 peticiones simultáneas (modo directo) o 5 (modo crawler)
- **Descubrimiento automático de sitemaps** desde robots.txt
- **Soporte para sitemap index** (sitemaps anidados)
- **Adición automática del protocolo HTTPS**
- **Generación de reportes en formato CSV**
- **Reportes organizados por dominio** (modo crawler)
- **Configuración mediante variables de entorno**
- **Indicadores visuales en tiempo real** con emojis de estado (🟢🟠🔴)
- **Manejo robusto de errores** y logging detallado
- **Sin dependencias externas** (solo módulos nativos de Node.js)

## 🚀 Rendimiento

- Procesa URLs en lotes de 5 peticiones concurrentes
- Maneja automáticamente los límites de tasa de la API
- Manejo eficiente de archivos CSV
- Usa solo módulos nativos de Node.js (`https`, `fs`, `path`)

## ⚠️ Manejo de Errores

- Valida la presencia de la clave API al inicio
- Maneja errores de red de forma elegante
- Reporta análisis fallidos en el CSV de salida
- Mensajes de error descriptivos en consola
- Continúa procesando URLs incluso si algunas fallan

## 📂 Estructura del Proyecto

```
page_speed_insights_report/
├── index.js                      # Script principal con ambos modos
├── package.json                  # Configuración del proyecto
├── .env                          # Variables de entorno (crear manualmente)
├── urls.csv                      # Archivo de entrada con URLs o dominios
├── resultados_pagespeed_directo.csv     # Salida del modo directo
├── resultados_por_dominio/       # Carpeta con salidas del modo crawler
│   ├── example_com.csv
│   ├── mywebsite_com.csv
│   └── ...
└── readme.md                     # Este archivo
```

## 🔧 Configuración Avanzada

### Ajustar el límite de concurrencia

Puedes modificar el número de peticiones simultáneas editando las variables `concurrencyLimit` en `index.js`:

**Para el modo directo** (línea ~103):
```javascript
const concurrencyLimit = 15; // Valor por defecto
```

**Para el modo crawler** (línea ~259):
```javascript
const concurrencyLimit = 5; // Valor por defecto, más conservador
```

**Nota:** Ten cuidado con valores muy altos para evitar:
- Límites de tasa de la API de Google
- Sobrecarga del servidor objetivo
- Posibles bloqueos por exceso de peticiones

### Estrategia de análisis

El script está configurado para analizar en modo **mobile** por defecto. Para cambiar a desktop, modifica la línea 44:

```javascript
// Cambiar de 'mobile' a 'desktop'
const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGE_SPEED_INSIGHTS_API_KEY}&strategy=desktop`;
```

### Variables de entorno personalizadas

Puedes configurar rutas personalizadas en tu archivo `.env`:

```env
PAGE_SPEED_INSIGHTS_API_KEY=tu_clave_api_aqui
# Agrega más configuraciones según necesites
```

## 📄 Licencia

ISC License

## 👤 Autor

Steve Moya Cepeda

## 🔗 Repositorio

[GitHub Repository](https://github.com/SteveMoya/page_speed_insights_report)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.
