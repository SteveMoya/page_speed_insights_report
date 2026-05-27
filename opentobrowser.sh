#!/bin/bash

# 1. Verificar argumento
ARCHIVO_LISTA=$1

if [ -z "$ARCHIVO_LISTA" ]; then
    echo "❌ Error: Debes indicar el archivo de la lista."
    echo "Uso: ./abrir_dominios.sh lista.csv"
    exit 1
fi

if [ ! -f "$ARCHIVO_LISTA" ]; then
    echo "❌ Error: El archivo '$ARCHIVO_LISTA' no existe."
    exit 1
fi

# 2. Detectar sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    ABRIR="open"      # macOS
else
    ABRIR="xdg-open"  # Linux
fi

echo "🚀 Procesando lista de dominios..."

# 3. Leer línea por línea (sin separador de comas)
while read -r linea || [ -n "$linea" ]; do
    
    # Limpieza: 
    # 'tr -d' elimina retornos de carro (\r) si el archivo viene de Windows
    # 'xargs' elimina espacios al principio y final
    dominio=$(echo "$linea" | tr -d '\r' | xargs)

    # Si la línea no está vacía, procedemos
    if [ -n "$dominio" ]; then
        
        # Construimos la URL completa agregando https://
        url_final="https://$dominio/wp-admin"
        
        echo "   -> Abriendo: $url_final"
        $ABRIR "$url_final" &>/dev/null
        
        # Pausa de seguridad (ajusta a 1 o 2 segundos si tu PC es lenta)
        sleep 0.5
    fi

done < "$ARCHIVO_LISTA"

echo "✅ Todas las webs han sido lanzadas."