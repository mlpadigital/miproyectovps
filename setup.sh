#!/bin/bash

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar utilidades básicas
sudo apt install -y curl git ufw

# Configurar firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# Instalar Nginx y Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Verificar Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Instalar Node.js (última versión estable LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Mostrar versiones instaladas
echo "✅ Instalación completa"
echo "Nginx version:"
nginx -v
echo "Node.js version:"
node -v
echo "npm version:"
npm -v
