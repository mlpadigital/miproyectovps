#!/bin/bash

# Script para configurar la integración con Supabase y el sistema de subdominios dinámicos
# Debe ejecutarse con sudo: sudo ./setup_integration.sh

echo "Configurando entorno de subdominios..."

# 1. Instalar el template de Nginx
mkdir -p /home/martin/miproyectovps/panel
cp /home/martin/miproyectovps/panel/nginx_store_template.conf /etc/nginx/nginx_store_template.conf

# 2. Instalar los scripts de gestión
cp /home/martin/miproyectovps/panel/create_subdomain.sh /usr/local/bin/create_subdomain
cp /home/martin/miproyectovps/panel/delete_subdomain.sh /usr/local/bin/delete_subdomain
chmod +x /usr/local/bin/create_subdomain
chmod +x /usr/local/bin/delete_subdomain

# 3. Configurar permisos sudoers (solo si no existen)
SUDOERS_FILE="/etc/sudoers.d/vps_subdomains"
if [ ! -f "$SUDOERS_FILE" ]; then
    echo "martin ALL=(ALL) NOPASSWD: /usr/local/bin/create_subdomain, /usr/local/bin/delete_subdomain, /usr/bin/systemctl reload nginx, /usr/bin/nginx" > "$SUDOERS_FILE"
    chmod 0440 "$SUDOERS_FILE"
fi

# 4. Migrar subdominios existentes al nuevo esquema dinámico
echo "Migrando archivos de configuración de subdominios existentes..."
TEMPLATE="/home/martin/miproyectovps/panel/nginx_store_template.conf"
for conf in /etc/nginx/sites-available/*.mlpadigital.com.conf; do
    [ -e "$conf" ] || continue
    subdomain=$(basename "$conf" .mlpadigital.com.conf)
    if [ "$subdomain" != "www" ] && [ "$subdomain" != "@" ]; then
        echo "Actualizando configuración para: $subdomain"
        export SUBDOMAIN=$subdomain
        envsubst '${SUBDOMAIN}' < "$TEMPLATE" > "$conf"
    fi
done

# 5. Preparar el directorio maestro
mkdir -p /var/www/master-store/dist
chown -R martin:martin /var/www/master-store

# 6. Desplegar el build de la tienda (si existe en el scratch)
SCRATCH_BUILD="/home/martin/.gemini/antigravity/scratch/master_store_local/dist"
if [ -d "$SCRATCH_BUILD" ]; then
    echo "Desplegando build de la tienda desde el área temporal..."
    # Limpiar primero para asegurar que no queden archivos viejos
    rm -rf /var/www/master-store/dist/*
    cp -r "$SCRATCH_BUILD/." /var/www/master-store/dist/
    chown -R www-data:www-data /var/www/master-store
fi

# 7. Reiniciar Nginx
nginx -t && systemctl reload nginx

echo "¡Configuración y migración completada exitosamente!"
