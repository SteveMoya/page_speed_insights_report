# PageSpeed Insights Report Generator

A Node.js tool to batch analyze website performance using Google PageSpeed Insights API.

## 📋 Description

This tool automatically analyzes multiple websites using Google PageSpeed Insights API and generates a CSV report with performance scores. It's perfect for monitoring the performance of multiple websites simultaneously.

## ⚙️ Prerequisites

- Node.js installed
- Google PageSpeed Insights API key

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/SteveMoya/page_speed_insights_report.git
cd page_speed_insights_report
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your PageSpeed Insights API key to `.env`:
```
PAGE_SPEED_INSIGHTS_API_KEY=your_api_key_here
```

## 📝 Usage

1. Add your URLs to `urls.csv`, one per line:
```
example.com
another-site.com
```

2. Run the script:
```bash
npm start
```

3. Check the results in `resultados_pagespeed.csv`

## 📊 Output

The script generates a CSV file (`resultados_pagespeed.csv`) with two columns:
- `Pagina`: The analyzed URL
- `Puntaje_PageSpeed`: Performance score (0-100) or "Error" if analysis failed

## ⚡ Features

- Batch analysis of multiple URLs
- Parallel processing (5 concurrent requests)
- Automatic HTTPS protocol addition
- CSV report generation
- Environment variable configuration
- Error handling and logging

## 🚀 Performance

- Processes URLs in batches of 5 concurrent requests
- Automatically handles API rate limiting
- Efficient CSV file handling

## ⚠️ Error Handling

- Validates API key presence
- Handles network errors gracefully
- Reports failed analyses in output CSV

## 📄 License

ISC License

## 👤 Author

Steve Moya Cepeda

## 🔗 Repository

[GitHub Repository](https://github.com/SteveMoya/page_speed_insights_report)