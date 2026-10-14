#!/bin/bash

# 1. Verificar argumento
ARCHIVO_LISTA=$1

if [ -z "$ARCHIVO_LISTA" ]; then
    echo "❌ Error: Debes indicar el archivo de la lista."
    echo "Uso: ./opentobrowser.sh lista.csv"
    exit 1
fi

if [ ! -f "$ARCHIVO_LISTA" ]; then
    echo "❌ Error: El archivo '$ARCHIVO_LISTA' no existe."
    exit 1
fi

# 2. Detectar sistema operativo / entorno
if [ -n "$WSL_DISTRO_NAME" ] || grep -qi microsoft /proc/version 2>/dev/null; then
    SO="wsl"        # Windows Subsystem for Linux
elif [[ "$OSTYPE" == "darwin"* ]]; then
    SO="mac"        # macOS
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* || "$OSTYPE" == "mingw"* ]]; then
    SO="win"        # Git Bash / MSYS2 / Cygwin
else
    SO="linux"      # Linux nativo
fi

# Abre una URL en el navegador por defecto del sistema.
# Si defines la variable NAVEGADOR, se usa ese ejecutable concreto.
# Ejemplo (Vivaldi en Git Bash): NAVEGADOR="/c/Users/TU_USUARIO/AppData/Local/Vivaldi/Application/vivaldi.exe" ./opentobrowser.sh urls.csv
abrir_url() {
    local url="$1"

    if [ -n "$NAVEGADOR" ]; then
        "$NAVEGADOR" "$url" &>/dev/null
        return
    fi

    case "$SO" in
        mac)
            open "$url" &>/dev/null
            ;;
        wsl)
            if command -v wslview >/dev/null 2>&1; then
                wslview "$url" &>/dev/null
            else
                powershell.exe -NoProfile -Command "Start-Process '$url'" &>/dev/null
            fi
            ;;
        win)
            # '//c' evita que MSYS convierta /c en una ruta de disco
            cmd.exe //c start "" "$url" &>/dev/null
            ;;
        *)
            xdg-open "$url" &>/dev/null
            ;;
    esac
}

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
        abrir_url "$url_final"
        
        # Pausa de seguridad (ajusta a 1 o 2 segundos si tu PC es lenta)
        sleep 0.5
    fi

done < "$ARCHIVO_LISTA"

echo "✅ Todas las webs han sido lanzadas."