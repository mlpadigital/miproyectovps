#!/bin/bash
set -euo pipefail

echo "-> Installing Nginx Store Template..."
sudo cp /home/martin/miproyectovps/panel/nginx_store_template.conf /usr/local/bin/
sudo chmod 644 /usr/local/bin/nginx_store_template.conf

echo "-> Installing create_subdomain.sh..."
sudo cp /home/martin/miproyectovps/panel/create_subdomain.sh /usr/local/bin/
sudo chmod 750 /usr/local/bin/create_subdomain.sh
sudo chown root:martin /usr/local/bin/create_subdomain.sh

echo "-> Configuring Sudoers..."
# Allow 'martin' to run the script without password
echo 'martin ALL=(root) NOPASSWD: /usr/local/bin/create_subdomain.sh' | sudo tee /etc/sudoers.d/vps-subdomain-creation
sudo chmod 440 /etc/sudoers.d/vps-subdomain-creation

echo "-> Restarting Panel Service..."
sudo systemctl restart vps-panel.service

echo "Done! The endpoint /api/create-client-store is ready."
