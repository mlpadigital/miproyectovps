#!/bin/bash
set -euo pipefail

SUBDOMAIN="$1"

if [[ ! "$SUBDOMAIN" =~ ^[a-z0-9-]+$ ]]; then
  echo "Error: Invalid subdomain format."
  exit 1
fi

DOMAIN="${SUBDOMAIN}.mlpadigital.com"
CONFIG_FILE="/etc/nginx/sites-available/${DOMAIN}.conf"
WEB_ROOT="/var/www/${SUBDOMAIN}"

echo "Creating subdomain: $DOMAIN"

# 1. Create Web Root
sudo mkdir -p "$WEB_ROOT"
echo "<h1>Tienda: $SUBDOMAIN</h1><p>Generada automáticamente.</p>" | sudo tee "$WEB_ROOT/index.html" > /dev/null
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# 2. Create Nginx Config
# We use the template located in the same directory as this script (after install) or fallback
TEMPLATE="/usr/local/bin/nginx_store_template.conf"

if [ ! -f "$TEMPLATE" ]; then
    echo "Template not found at $TEMPLATE, using simple default."
    # Fallback content
    sudo tee "$CONFIG_FILE" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $WEB_ROOT;
    index index.html;
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF
else
    # Replace placeholder in template
    # Note: We use envsubst if available, or simple sed
    export SUBDOMAIN
    envsubst '${SUBDOMAIN}' < "$TEMPLATE" | sudo tee "$CONFIG_FILE" > /dev/null
fi

# 3. Enable Site
sudo ln -sf "$CONFIG_FILE" "/etc/nginx/sites-enabled/"

# 4. Reload Nginx
sudo systemctl reload nginx

echo "Success: $DOMAIN created."
