# 📊 Page Speed Insights Report

<p align="center">
  <strong>Herramienta de análisis de rendimiento web con Google PageSpeed Insights API</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Google%20PSI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="PageSpeed Insights">
  <img src="https://img.shields.io/badge/Performance-Optimization-FF6B6B?style=for-the-badge" alt="Performance">
</p>

---

## 🎯 Descripción

Herramienta automatizada para analizar el rendimiento de sitios web utilizando la API de **Google PageSpeed Insights**. Genera reportes detallados con métricas de rendimiento, accesibilidad, mejores prácticas y SEO.

**Características:**
- 🚀 Análisis de rendimiento (Core Web Vitals)
- ♿ Auditoría de accesibilidad
- ✅ Verificación de mejores prácticas
- 🔍 Análisis de SEO
- 📱 Pruebas en mobile y desktop
- 📊 Reportes en formato JSON y HTML

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| **Node.js** | Runtime JavaScript |
| **Google PSI API** | Análisis de rendimiento |
| **Axios** | HTTP client para API calls |
| **FS** | Generación de reportes |

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/SteveMoya/page_speed_insights_report.git
cd page_speed_insights_report

# Instalar dependencias
npm install
```

---

## 📋 Uso

### Análisis básico
```bash
node index.js https://ejemplo.com
```

### Análisis con estrategia específica
```bash
# Mobile
node index.js https://ejemplo.com mobile

# Desktop
node index.js https://ejemplo.com desktop
```

### Análisis múltiple
```bash
node index.js urls.txt
```

El archivo `urls.txt` debe contener una URL por línea:
```
https://ejemplo1.com
https://ejemplo2.com
https://ejemplo3.com
```

---

## 📊 Métricas Analizadas

### Core Web Vitals
- **LCP** (Largest Contentful Paint) - Tiempo de carga del contenido principal
- **FID** (First Input Delay) - Latencia de interacción
- **CLS** (Cumulative Layout Shift) - Estabilidad visual
- **FCP** (First Contentful Paint) - Primera pintura de contenido
- **TTFB** (Time to First Byte) - Tiempo hasta el primer byte

### Categorías de Análisis
- **Performance** (0-100) - Rendimiento general
- **Accessibility** (0-100) - Accesibilidad web
- **Best Practices** (0-100) - Mejores prácticas
- **SEO** (0-100) - Optimización para motores de búsqueda

---

## 📁 Estructura del Proyecto

```
page_speed_insights_report/
├── index.js              # Script principal
├── package.json          # Dependencias
├── reports/              # Reportes generados
│   ├── json/            # Reportes JSON
│   └── html/            # Reportes HTML
└── README.md
```

---

## 📝 Ejemplo de Output

```json
{
  "url": "https://ejemplo.com",
  "timestamp": "2024-01-15T10:30:00Z",
  "strategy": "mobile",
  "scores": {
    "performance": 92,
    "accessibility": 98,
    "best-practices": 95,
    "seo": 100
  },
  "metrics": {
    "LCP": 2.1,
    "FID": 45,
    "CLS": 0.05,
    "FCP": 1.8,
    "TTFB": 0.6
  }
}
```

---

## 🔧 Configuración

Puedes configurar el script editando las opciones en `index.js`:

```javascript
const options = {
  strategy: 'mobile',        // 'mobile' o 'desktop'
  category: ['performance'], // Categorías a analizar
  locale: 'es-419'           // Idioma del reporte
};
```

---

## 💡 Casos de Uso

- **Auditoría SEO**: Identificar problemas de rendimiento que afectan el ranking
- **Optimización Web**: Monitorear mejoras de rendimiento después de cambios
- **Benchmarking**: Comparar rendimiento de múltiples sitios
- **Monitoreo Continuo**: Integrar en pipelines CI/CD
- **Reportes para Clientes**: Generar reportes profesionales de rendimiento

---

## 📊 Interpretación de Scores

| Score | Clasificación | Color |
|-------|---------------|-------|
| 90-100 | 🟢 Bueno | Verde |
| 50-89 | 🟠 Necesita Mejora | Naranja |
| 0-49 | 🔴 Pobre | Rojo |

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:
1. Abre un issue para discutir lo que quieres cambiar
2. Haz fork del repositorio
3. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
4. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

---

## 📄 Licencia

MIT © Steve Moya Cepeda

---

<p align="center">
  <a href="https://stevemoya.me" target="_blank">
    <img src="https://img.shields.io/badge/Portfolio-stevemoya.me-00D4FF?style=for-the-badge&labelColor=0A0A0A" alt="Portfolio">
  </a>
  <a href="https://linkedin.com/in/steve-moya-cepeda" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
</p>
