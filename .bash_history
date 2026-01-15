sudo reboot
usermod -aG sudo martin
id martin
sudo apt update
bash setup.sh
nano setup.sh
chmod +x setup.sh
./setup.sh
sudo nano /etc/nginx/conf.d/tenants.map.conf
sudo nginx -t
dig cliente1.mlpadigital.com +short
sudo certbot --nginx -d cliente1.mlpadigital.com --redirect
ls /etc/nginx/conf.d/
ls /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/conf.d/cliente1.conf
sudo nginx -t
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo certbot --nginx -d cliente1.mlpadigital.com --redirect
nano /etc/nginx/conf.d/cliente1.conf
sudo nginx -t
sudo systemctl reload nginx
nano /etc/nginx/conf.d/cliente1.conf
sudo nano /etc/nginx/conf.d/cliente1.conf
ls -l /etc/nginx/conf.d/cliente1.conf
sudo nginx -t
sudo systemctl reload nginx
sudo grep -R "mlpadigital.com" /etc/nginx/
sudo nano /etc/nginx/conf.d/tenants.map.conf
sudo nginx -t
sudo systemctl reload nginx
sudo nano /etc/nginx/conf.d/tenants.map.conf
sudo nginx -t
sudo systemctl reload nginx
systemctl status nginx
curl -I http://cliente1.mlpadigital.com
sudo lsof -i -P -n | grep LISTEN | grep 8101
curl http://127.0.0.1:8101
node app.js --port 8101
nano /etc/nginx/nginx.conf
git init
git add .
git commit -m "subida inicial"
git branch -M main
git remote add origin https://github.com/mlpadigital/miproyectovps.git
git push -U origin main
git push -u origin main
echo -e ".antigravity-server/\n.vscode-server/\n.cache/\n.ssh/" > .gitignore
git rm -r --cached .
git add .
git commit -m "Limpieza: ignorar archivos de sistema y cache"
git push -u origin main
rm -rf .git
git init
git branch -M main
git remote add origin https://github.com/mlpadigital/miproyectovps.git
echo -e ".antigravity-server/\n.vscode-server/\n.cache/\n.ssh/" > .gitignore
git add .
git commit -m "Subida limpia"
git push -u --force origin main
sudo apt update && sudo apt install git -y
git clonehttps://github.com/mlpadigital/miproyectovps.git
git clone https://github.com/mlpadigital/miproyectovps.git
cd miproyectovps
REPO=https://github.com/mlpadigital/miproyectovps.git
DEST=/home/martin/miproyectovps
set -e
if [ -d "$DEST/.git" ]; then   git -C "$DEST" pull; else   if [ -d "$DEST" ] && [ "$(ls -A $DEST)" ]; then     tmp=$(mktemp -d);     git clone "$REPO" "$tmp";     rsync -a --delete "$tmp/" "$DEST/";     rm -rf "$tmp";   else     git clone "$REPO" "$DEST";   fi; fi
ls -la "$DEST" | sed -n '1,200p'
ls -la /home/martin/miproyectovps | sed -n '1,200p'
echo '--- setup.sh ---'
sed -n '1,400p' /home/martin/miproyectovps/setup.sh || true
cd /home/martin/miproyectovps
echo '=== Ejecutando setup.sh ==='
sudo bash setup.sh 2>&1 | sed -u 's/^/SETUP: /'
cd /home/martin/miproyectovps
echo '=== Ejecutando setup.sh ==='
sudo bash setup.sh 2>&1 | sed -u 's/^/SETUP: /'
echo '=== Ejecutando setup.sh ==='
sudo bash setup.sh 2>&1 | sed -u 's/^/SETUP: /'
echo '=== Verificaciones ==='
echo 'UFW status:'
sudo ufw status verbose || true
echo '=== HTTP local (HEAD) ==='
curl -I http://localhost 2>&1 | sed -n '1,200p'
echo '\n=== HTTP local (GET, primeras 200 líneas) ==='
curl -s http://localhost | sed -n '1,200p'
echo '\n=== /var/log/nginx/error.log (últimas 200 líneas) ==='
sudo sh -c 'if [ -f /var/log/nginx/error.log ]; then tail -n 200 /var/log/nginx/error.log; else echo "No existe /var/log/nginx/error.log"; fi'
echo '=== HTTP local (HEAD) ==='
curl -I http://localhost 2>&1 | sed -n '1,200p'
echo '\n=== HTTP local (GET, primeras 200 líneas) ==='
curl -s http://localhost | sed -n '1,200p'
echo '\n=== /var/log/nginx/error.log (últimas 200 líneas) ==='
sudo sh -c 'if [ -f /var/log/nginx/error.log ]; then tail -n 200 /var/log/nginx/error.log; else echo "No existe /var/log/nginx/error.log"; fi'
o "No existe /var/log/nginx/access.log"; fi'
echo '\n=== journalctl -u nginx (últimas 200 entradas) ==='
sudo journalctl -u nginx --no-pager -n 200 || true
curl -I http://localhost 2>&1 | sed -n '1,200p'
echo '\n=== HTTP local (GET, primeras 200 líneas) ==='
curl -s http://localhost | sed -n '1,200p'
echo '\n=== /var/log/nginx/error.log (últimas 200 líneas) ==='
sudo sh -c 'if [ -f /var/log/nginx/error.log ]; then tail -n 200 /var/log/nginx/error.log; else echo "No existe /var/log/nginx/error.log"; fi'
sudo tail -n 200 /var/log/nginx/error.log || true
echo '\n=== /var/log/nginx/access.log (últimas 200 líneas) ==='
sudo tail -n 200 /var/log/nginx/access.log || true
# Copiar unidad systemd, configurar sudoers, crear htpasswd y habilitar servicio + nginx site
set -e
REPO_DIR=/home/martin/miproyectovps
# 1) copiar service
sudo cp $REPO_DIR/vps-panel.service /etc/systemd/system/vps-panel.service
in/systemctl stop *, /bin/systemctl restart *, /bin/systemctl status *' | sudo tee /etc/sudoers.d/vps-panel > /dev/null
sudo chmod 440 /etc/sudoers.d/vps-panel

PW='cambiar123'
USER='panel'
HASH=$(openssl passwd -apr1 "$PW")
echo "$USER:$HASH" | sudo tee /etc/nginx/.htpasswd_panel > /dev/null
sudo chmod 640 /etc/nginx/.htpasswd_panel

cd $REPO_DIR/panel
sudo chown -R martin:martin $REPO_DIR/panel

sudo tee /etc/nginx/sites-available/vps-panel.conf > /dev/null <<'NGCF'
server {
  listen 80;
  server_name _;

  location /panel/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    auth_basic "Panel VPS";
    auth_basic_user_file /etc/nginx/.htpasswd_panel;
  }
}
NGCF

sudo ln -sf /etc/nginx/sites-available/vps-panel.conf /etc/nginx/sites-enabled/vps-panel.conf
sudo nginx -t || true
sudo systemctl reload nginx || true

sudo systemctl status vps-panel.service --no-pager -l || true
sudo journalctl -u vps-panel.service --no-pager -n 50 || true

curl -I http://127.0.0.1/panel/ 2>&1 | sed -n '1,200p' || true
sudo systemctl daemon-reload
sudo cp /home/martin/miproyectovps/vps-panel.service /etc/systemd/system/vps-panel.service
sudo systemctl status vps-panel.service --no-pager -l -n 20 || true
sudo journalctl -u vps-panel.service --no-pager -n 200 || true
sudo /usr/bin/node /home/martin/miproyectovps/panel/index.js 2>&1 | sed -n '1,200p'
ls -la /home/martin/miproyectovps/panel || true
sed -n '1,400p' /home/martin/miproyectovps/panel/index.js || true
echo '--- package.json ---'
sed -n '1,200p' /home/martin/miproyectovps/panel/package.json || true
echo '--- public/index.html ---'
sed -n '1,400p' /home/martin/miproyectovps/panel/public/index.html || true
cat /home/martin/miproyectovps/panel/package.json
sed -n '1,400p' /home/martin/miproyectovps/panel/public/index.html
set -e
cd /home/martin/miproyectovps/panel
if [ -f package.json ]; then   echo '>> instalando npm dependencies en panel';   npm install --no-audit --no-fund --silent || true; else   echo '>> package.json no encontrado'; fi
# crear unidad systemd
UNIT_FILE=/etc/systemd/system/vps-panel.service
sudo tee "$UNIT_FILE" > /dev/null << 'UNIT'
[Unit]
Description=VPS Panel
After=network.target

[Service]
User=martin
WorkingDirectory=/home/martin/miproyectovps/panel
ExecStart=/usr/bin/node /home/martin/miproyectovps/panel/index.js
Restart=always
Environment=PORT=3000
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

npm install --no-audit --no-fund --silent || true
sudo tee /etc/systemd/system/vps-panel.service > /dev/null << 'UNIT'
[Unit]
Description=VPS Panel
After=network.target

[Service]
User=martin
WorkingDirectory=/home/martin/miproyectovps/panel
ExecStart=/usr/bin/node /home/martin/miproyectovps/panel/index.js
Restart=always
Environment=PORT=3000
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl status vps-panel --no-pager -l || true
sudo journalctl -u vps-panel --no-pager -n 200 || true
cd /home/martin/miproyectovps/panel && /usr/bin/node index.js
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund --silent
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund
echo 'Voy a mostrar `panel/package.json` para corregir.'
sed -n '1,200p' /home/martin/miproyectovps/panel/package.json
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund --silent
sudo cp /home/martin/miproyectovps/panel/nginx-panel.conf /etc/nginx/sites-available/vps-panel.conf || true
sudo systemctl daemon-reload || true
ps aux | grep node | grep -v grep || true
ss -lptn | grep 3000 || true
curl -sI http://127.0.0.1:8080/panel/ || true
cd /home/martin/miproyectovps/panel
nohup node server.js >/tmp/vps-panel.log 2>&1 &
sleep 1
ps aux | grep 'node server.js' | grep -v grep || true
curl -sI http://127.0.0.1:8080/panel/ || true
curl -s http://127.0.0.1:8080/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
nohup node server.js >/tmp/vps-panel.log 2>&1 &
sleep 1
ps aux | grep 'node server.js' | grep -v grep || true
curl -sI http://127.0.0.1:8080/panel/ || true
curl -s http://127.0.0.1:8080/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
curl -sI http://127.0.0.1:8080/panel/
sudo sed -n '1,200p' /etc/nginx/sites-enabled/vps-panel.conf || true
sudo cp /home/martin/miproyectovps/panel/nginx-panel.conf /etc/nginx/sites-available/vps-panel.conf
ginx -t
sudo systemctl reload nginx
ss -ltnp | sed -n '1,200p' || true
sudo sed -n '1,240p' /etc/nginx/sites-available/default || true
sudo tee /etc/nginx/snippets/vps-panel.conf > /dev/null <<'EOF'
location /panel/ {
  proxy_pass http://127.0.0.1:3000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location = /panel {
  return 301 /panel/;
}
EOF

sudo sed -n '1,240p' /etc/nginx/snippets/vps-panel.conf || true
.0.0.1/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
set -e
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "CHECK: revisar authorized_keys..."
AK=/home/martin/.ssh/authorized_keys
if [ -f "$AK" ] && [ -s "$AK" ]; then   echo "FOUND_KEYS=1";   CHANGE_PASSWD=1; else   echo "FOUND_KEYS=0 (no cambiar PasswordAuthentication para evitar bloqueo)";   CHANGE_PASSWD=0; fi
# Backup sshd_config
SSHD=/etc/ssh/sshd_config
sudo cp "$SSHD" "$SSHD.bak.$TIMESTAMP" || true
s apt-listchanges fail2ban prometheus-node-exporter apache2-utils || true
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund --silent
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund
echo 'Voy a mostrar `panel/package.json` para corregir.'
sed -n '1,200p' /home/martin/miproyectovps/panel/package.json
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund --silent
sudo cp /home/martin/miproyectovps/panel/nginx-panel.conf /etc/nginx/sites-available/vps-panel.conf || true
sudo systemctl daemon-reload || true
ps aux | grep node | grep -v grep || true
ss -lptn | grep 3000 || true
curl -sI http://127.0.0.1:8080/panel/ || true
cd /home/martin/miproyectovps/panel
nohup node server.js >/tmp/vps-panel.log 2>&1 &
sleep 1
ps aux | grep 'node server.js' | grep -v grep || true
curl -sI http://127.0.0.1:8080/panel/ || true
curl -s http://127.0.0.1:8080/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
nohup node server.js >/tmp/vps-panel.log 2>&1 &
sleep 1
ps aux | grep 'node server.js' | grep -v grep || true
curl -sI http://127.0.0.1:8080/panel/ || true
curl -s http://127.0.0.1:8080/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
curl -sI http://127.0.0.1:8080/panel/
sudo sed -n '1,200p' /etc/nginx/sites-enabled/vps-panel.conf || true
sudo cp /home/martin/miproyectovps/panel/nginx-panel.conf /etc/nginx/sites-available/vps-panel.conf
ginx -t
sudo systemctl reload nginx
ss -ltnp | sed -n '1,200p' || true
sudo sed -n '1,240p' /etc/nginx/sites-available/default || true
sudo tee /etc/nginx/snippets/vps-panel.conf > /dev/null <<'EOF'
location /panel/ {
  proxy_pass http://127.0.0.1:3000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location = /panel {
  return 301 /panel/;
}
EOF

sudo sed -n '1,240p' /etc/nginx/snippets/vps-panel.conf || true
.0.0.1/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
set -e
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "CHECK: revisar authorized_keys..."
AK=/home/martin/.ssh/authorized_keys
if [ -f "$AK" ] && [ -s "$AK" ]; then   echo "FOUND_KEYS=1";   CHANGE_PASSWD=1; else   echo "FOUND_KEYS=0 (no cambiar PasswordAuthentication para evitar bloqueo)";   CHANGE_PASSWD=0; fi
# Backup sshd_config
SSHD=/etc/ssh/sshd_config
sudo cp "$SSHD" "$SSHD.bak.$TIMESTAMP" || true
s apt-listchanges fail2ban prometheus-node-exporter apache2-utils || true
# Habilitar unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades || true
sudo tee /etc/nginx/sites-available/panel.mlpadigital.com.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name panel.mlpadigital.com;

    location / {
        auth_basic "Panel VPS";
        auth_basic_user_file /etc/nginx/.panel_users;
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/panel.mlpadigital.com.conf /etc/nginx/sites-enabled/panel.mlpadigital.com.conf
rar status nginx y certbot certificates
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund --silent
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund
echo 'Voy a mostrar `panel/package.json` para corregir.'
sed -n '1,200p' /home/martin/miproyectovps/panel/package.json
cd /home/martin/miproyectovps/panel && npm install --no-audit --no-fund --silent
sudo cp /home/martin/miproyectovps/panel/nginx-panel.conf /etc/nginx/sites-available/vps-panel.conf || true
sudo systemctl daemon-reload || true
ps aux | grep node | grep -v grep || true
ss -lptn | grep 3000 || true
curl -sI http://127.0.0.1:8080/panel/ || true
cd /home/martin/miproyectovps/panel
nohup node server.js >/tmp/vps-panel.log 2>&1 &
sleep 1
ps aux | grep 'node server.js' | grep -v grep || true
curl -sI http://127.0.0.1:8080/panel/ || true
curl -s http://127.0.0.1:8080/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
nohup node server.js >/tmp/vps-panel.log 2>&1 &
sleep 1
ps aux | grep 'node server.js' | grep -v grep || true
curl -sI http://127.0.0.1:8080/panel/ || true
curl -s http://127.0.0.1:8080/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
curl -sI http://127.0.0.1:8080/panel/
sudo sed -n '1,200p' /etc/nginx/sites-enabled/vps-panel.conf || true
sudo cp /home/martin/miproyectovps/panel/nginx-panel.conf /etc/nginx/sites-available/vps-panel.conf
ginx -t
sudo systemctl reload nginx
ss -ltnp | sed -n '1,200p' || true
sudo sed -n '1,240p' /etc/nginx/sites-available/default || true
sudo tee /etc/nginx/snippets/vps-panel.conf > /dev/null <<'EOF'
location /panel/ {
  proxy_pass http://127.0.0.1:3000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location = /panel {
  return 301 /panel/;
}
EOF

sudo sed -n '1,240p' /etc/nginx/snippets/vps-panel.conf || true
.0.0.1/panel/ | sed -n '1,80p' || true
curl -s http://127.0.0.1:3000/status | sed -n '1,200p' || true
set -e
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "CHECK: revisar authorized_keys..."
AK=/home/martin/.ssh/authorized_keys
if [ -f "$AK" ] && [ -s "$AK" ]; then   echo "FOUND_KEYS=1";   CHANGE_PASSWD=1; else   echo "FOUND_KEYS=0 (no cambiar PasswordAuthentication para evitar bloqueo)";   CHANGE_PASSWD=0; fi
# Backup sshd_config
SSHD=/etc/ssh/sshd_config
sudo cp "$SSHD" "$SSHD.bak.$TIMESTAMP" || true
s apt-listchanges fail2ban prometheus-node-exporter apache2-utils || true
# Habilitar unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades || true
sudo tee /etc/nginx/sites-available/panel.mlpadigital.com.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name panel.mlpadigital.com;

    location / {
        auth_basic "Panel VPS";
        auth_basic_user_file /etc/nginx/.panel_users;
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/panel.mlpadigital.com.conf /etc/nginx/sites-enabled/panel.mlpadigital.com.conf
rar status nginx y certbot certificates
sudo certbot --nginx -d panel.mlpadigital.com --non-interactive --agree-tos -m digitalmlpa@gmail.com --redirect || true
curl -I https://panel.mlpadigital.com || true
sudo systemctl status nginx --no-pager -l || true
sudo systemctl restart vps-panel || true
sudo systemctl restart vps-panel.service && sleep 1 && sudo systemctl status vps-panel --no-pager -l || true
sudo journalctl -u vps-panel -n 120 --no-pager | sed -n '1,200p'
# revisar sudoers actual
sudo sed -n '1,240p' /etc/sudoers.d/vps-panel || true
e
sudo sed -n '1,240p' /etc/sudoers.d/vps-panel || true
ls -l /etc/nginx/.panel_users || true
id www-data || true
sudo chown root:www-data /etc/nginx/.panel_users || true
sudo htpasswd -b -c /etc/nginx/.panel_users admin 'Diosesmiguia1@' || true
sudo chown root:www-data /etc/nginx/.panel_users || true
url -sI https://panel.mlpadigital.com || true
echo '--- Prueba curl (con admin) ---'
curl -sI -u admin:'Diosesmiguia1@' https://panel.mlpadigital.com || true
ls -l /etc/nginx/.panel_users || true
sudo apt update -y && sudo apt install -y apache2-utils || true
ls -l /etc/nginx/.panel_users || true
sudo cat /etc/nginx/.panel_users || true
sudo htpasswd -b -c /etc/nginx/.panel_users admin 'Diosesmiguia1@'
I -u 'admin:Diosesmiguia1@' https://panel.mlpadigital.com -k || true
ls -l /etc/nginx/.panel_users || true
echo '--- curl response ---'
curl -sI -u 'admin:Diosesmiguia1@' https://panel.mlpadigital.com || true
sudo chown root:www-data /etc/nginx/.panel_users
ls -l /etc/nginx/.panel_users
curl -sI -u 'admin:Diosesmiguia1@' https://panel.mlpadigital.com || true
sudo chmod 640 /etc/nginx/.panel_users && ls -l /etc/nginx/.panel_users && sudo nginx -t || true && sudo systemctl reload nginx || true && curl -sI -u 'admin:Diosesmiguia1@' https://panel.mlpadigital.com || true
sudo apt update -y && sudo apt install -y htop glances ncdu mtr nmap net-tools lsof tmux unzip zip rsync restic smartmontools iotop atop logwatch cockpit || true
sudo chmod +x /usr/local/bin/vps_restic_backup.sh || true
ls -l /usr/local/bin/vps_restic_backup.sh || true
sed -n '1,200p' /usr/local/bin/vps_restic_backup.sh || true
ls -l /etc/logrotate.d/vps-panel || true
sudo systemctl is-active cockpit.socket || true
sudo cp /home/martin/miproyectovps/panel/tools/vps_restic_backup.sh /usr/local/bin/vps_restic_backup.sh || true
}
LR
sudo systemctl restart cockpit.socket || true
ls -l /usr/local/bin/vps_restic_backup.sh || true
sed -n '1,200p' /usr/local/bin/vps_restic_backup.sh || true
ls -l /etc/logrotate.d/vps-panel || true
sudo ufw status verbose | sed -n '1,200p' || true
ss -ltnp | grep -E '3000|9090' || true
sed -n '1,200p' /usr/local/bin/vps_restic_backup.sh
ls -l /etc/logrotate.d/vps-panel || true
sudo ufw status verbose | sed -n '1,200p' || true
ss -ltnp | grep -E '3000|9090' || true
sudo tee /etc/logrotate.d/vps-panel > /dev/null <<'LR'
/var/log/vps-panel.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
LR

ls -l /etc/logrotate.d/vps-panel || true
sudo ufw status verbose | sed -n '1,200p' || true
ss -ltnp | grep -E '3000|9090' || true
ls -l /etc/logrotate.d/vps-panel || true
sudo ufw status verbose | sed -n '1,200p' || true
ss -ltnp | grep -E '3000|9090' || true
set -e
mkdir -p /home/martin/.ssh
ssh-keygen -t ed25519 -f /home/martin/.ssh/vps_admin_id_ed25519 -N "" -C "vps_admin@panel"
chown martin:martin /home/martin/.ssh/vps_admin_id_ed25519* || true
chmod 600 /home/martin/.ssh/vps_admin_id_ed25519 || true
chmod 644 /home/martin/.ssh/vps_admin_id_ed25519.pub || true
# ensure authorized_keys exists and contains the public key
touch /home/martin/.ssh/authorized_keys
grep -q "$(cat /home/martin/.ssh/vps_admin_id_ed25519.pub)" /home/martin/.ssh/authorized_keys || cat /home/martin/.ssh/vps_admin_id_ed25519.pub >> /home/martin/.ssh/authorized_keys
chown -R martin:martin /home/martin/.ssh
chmod 600 /home/martin/.ssh/authorized_keys
# backup sshd_config and set secure options
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak-$(date +%s)
echo "--- public key ---" && cat /home/martin/.ssh/vps_admin_id_ed25519.pub || true
echo "\n--- fingerprint ---" && ssh-keygen -lf /home/martin/.ssh/vps_admin_id_ed25519.pub || true
echo "\n--- authorized_keys owner/perm ---" && ls -l /home/martin/.ssh/authorized_keys || true
echo "\n--- sshd_config relevant lines ---" && grep -E "^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication)" /etc/ssh/sshd_config || true
echo "\n--- UFW status ---" && ufw status verbose || true
cd /home/martin/miproyectovps/panel && npm install --production --no-audit --no-fund
sudo sed -i 's/127.0.0.1:3000/127.0.0.1:3001/g' /etc/nginx/sites-available/panel.mlpadigital.com.conf || true
sudo systemctl status vps-panel --no-pager -l -n 50
sudo bash /home/martin/miproyectovps/panel/privileged_setup.sh |& tee /tmp/vps-priv-setup.log
tail -n 80 /tmp/vps-priv-setup.log
sudo bash /home/martin/miproyectovps/panel/privileged_alerts_setup.sh |& tee /tmp/vps-alerts-setup.log
tail -n 120 /tmp/vps-alerts-setup.log
# Descarga y extrae la última release de Alertmanager
LATEST=$(curl -s https://api.github.com/repos/prometheus/alertmanager/releases/latest | grep -Po '"tag_name":\s*"\K(.*)(?=")')
curl -sL "https://github.com/prometheus/alertmanager/releases/download/${LATEST}/alertmanager-${LATEST#v}.linux-amd64.tar.gz" -o /tmp/alertmanager.tar.gz
tar -xzf /tmp/alertmanager.tar.gz -C /tmp
# Instala binarios
sudo cp /tmp/alertmanager-${LATEST#v}.linux-amd64/alertmanager /usr/local/bin/
sudo cp /tmp/alertmanager-${LATEST#v}.linux-amd64/amtool /usr/local/bin/
sudo chmod 755 /usr/local/bin/alertmanager /usr/local/bin/amtool
# Crear usuario y dirs
sudo useradd --no-create-home --shell /usr/sbin/nologin alertmanager || true
sudo mkdir -p /etc/alertmanager /var/lib/alertmanager
sudo chown alertmanager:alertmanager /etc/alertmanager /var/lib/alertmanager
# Configuración mínima (webhook al receptor local)
sudo tee /etc/alertmanager/alertmanager.yml > /dev/null <<'YML'
global:
  resolve_timeout: 5m

route:
  receiver: 'log-receiver'

receivers:
  - name: 'log-receiver'
    webhook_configs:
      - url: 'http://localhost:5001/alert'
YML

sudo chown alertmanager:alertmanager /etc/alertmanager/alertmanager.yml
sudo chmod 640 /etc/alertmanager/alertmanager.yml
# Unidad systemd
sudo tee /etc/systemd/system/alertmanager.service > /dev/null <<'UNIT'
[Unit]
Description=Prometheus Alertmanager
Wants=network-online.target
After=network-online.target

[Service]
User=alertmanager
Group=alertmanager
Type=simple
ExecStart=/usr/local/bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml --storage.path=/var/lib/alertmanager
Restart=on-failure

[Install]
WantedBy=multi-user.target
UNIT

# Arrancar y mostrar estado
sudo systemctl daemon-reload
sudo systemctl enable --now alertmanager
sudo systemctl status alertmanager --no-pager -l
sudo bash /home/martin/miproyectovps/panel/privileged_alerts_setup.sh |& tee /tmp/vps-alerts-setup.log
tail -n 120 /tmp/vps-alerts-setup.log
sudo bash /home/martin/miproyectovps/panel/privileged_grafana_setup.sh |& tee /tmp/vps-grafana-provision.log
tail -n 120 /tmp/vps-grafana-provision.log
set -e
# check panel status and metrics
echo "--- vps-panel systemd status ---"; sudo systemctl status vps-panel --no-pager -l -n 20 || true
rometheus status ---"; sudo systemctl status prometheus --no-pager -l -n 10 || true
echo "\n--- grafana status ---"; sudo systemctl status grafana-server --no-pager -l -n 10 || true
echo "\n--- alertmanager status ---"; sudo systemctl status alertmanager --no-pager -l -n 10 || true

# logs
echo "\n--- last lines vps-alerts.log ---"; sudo tail -n 50 /var/log/vps-alerts.log || true
echo "\n--- last lines vps-restic-backup.log ---"; sudo tail -n 50 /var/log/vps-restic-backup.log || true

# check grafana dashboards folder
echo "\n--- grafana dashboards dir ---"; ls -l /var/lib/grafana/dashboards/vps || true
sudo systemctl status vps-panel --no-pager -l -n 20
curl -sS http://127.0.0.1:3001/status
curl -s http://127.0.0.1:3001/metrics | head -n 20
sudo systemctl status prometheus --no-pager -l -n 10
sudo systemctl status grafana-server --no-pager -l -n 10
sudo systemctl status alertmanager --no-pager -l -n 10
sudo tail -n 50 /var/log/vps-alerts.log
sudo tail -n 50 /var/log/vps-restic-backup.log
ls -l /var/lib/grafana/dashboards/vps
sudo systemctl status vps-panel --no-pager -l -n 20
curl -sS http://127.0.0.1:3001/status
curl -s http://127.0.0.1:3001/metrics | head -n 20
sudo systemctl status prometheus --no-pager -l -n 10
sudo systemctl status grafana-server --no-pager -l -n 10
sudo systemctl status alertmanager --no-pager -l -n 10
sudo tail -n 50 /var/log/vps-alerts.log
sudo tail -n 50 /var/log/vps-restic-backup.log
ls -l /var/lib/grafana/dashboards/vps
sudo touch /var/log/vps-restic-backup.log
sudo chown root:root /var/log/vps-restic-backup.log
sudo chmod 640 /var/log/vps-restic-backup.log
sudo /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
tail -n 80 /tmp/vps-restic-run.log
sudo systemctl status alertmanager --no-pager -l -n 20
sudo tail -n 80 /var/log/vps-alerts.log
sudo tail -n 120 /var/log/vps-restic-backup.log
sudo tail -n 120 /var/log/vps-alerts.log
sudo mkdir -p /root/.restic
sudo sh -c 'head -c 32 /dev/urandom | base64 > /root/.restic/password'
sudo chmod 600 /root/.restic/password
sudo mkdir -p /var/backups/restic
sudo chown root:root /var/backups/restic
sudo mkdir -p /root/.restic
sudo sh -c 'head -c 32 /dev/urandom | base64 > /root/.restic/password'
sudo chmod 600 /root/.restic/password
sudo mkdir -p /var/backups/restic
sudo chown root:root /var/backups/restic
export RESTIC_REPOSITORY=/var/backups/restic
export RESTIC_PASSWORD_FILE=/root/.restic/password
sudo -E restic init
export RESTIC_REPOSITORY=/var/backups/restic
export RESTIC_PASSWORD_FILE=/root/.restic/password
sudo -E restic init
sudo /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
export RESTIC_REPOSITORY=/var/backups/restic
export RESTIC_PASSWORD_FILE=/root/.restic/password
sudo -E restic snapshots
sudo -E restic check
sudo /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
sudo mkdir -p /root/.restic
sudo test -f /root/.restic/password || sudo sh -c 'head -c 32 /dev/urandom | base64 > /root/.restic/password'
sudo chmod 600 /root/.restic/password
sudo mkdir -p /var/backups/restic
sudo chown root:root /var/backups/restic
sudo sh -c 'export RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password; \
if [ -f /var/backups/restic/config ]; then echo "Restic repo existe"; else restic init; fi'
sudo -E RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
sudo mkdir -p /root/.restic
sudo test -f /root/.restic/password || sudo sh -c 'head -c 32 /dev/urandom | base64 > /root/.restic/password'
sudo chmod 600 /root/.restic/password
sudo mkdir -p /var/backups/restic
sudo chown root:root /var/backups/restic
sudo sh -c 'export RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password; \
if [ -f /var/backups/restic/config ]; then echo "Restic repo existe"; else restic init; fi'
sudo -E RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
ssh-keygen -t ed25519 -f ~/temporary_deployer_key -N ""
cat ~/temporary_deployer_key.pub
# reemplaza 'CLAVE_PUB' por el contenido de ~/temporary_deployer_key.pub
sudo adduser --disabled-password --gecos "" deployer
sudo mkdir -p /home/deployer/.ssh
echo 'CLAVE_PUB' | sudo tee /home/deployer/.ssh/authorized_keys
sudo chown -R deployer:deployer /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh
sudo chmod 600 /home/deployer/.ssh/authorized_keys
# (opcional) permitir sólo comandos limitados por sudo:
echo 'deployer ALL=(root) NOPASSWD: /usr/local/bin/vps_restic_backup.sh, /bin/systemctl restart vps-panel, /bin/systemctl restart nginx' | sudo tee /etc/sudoers.d/deployer
sudo chmod 440 /etc/sudoers.d/deployer
sudo mkdir -p /root/.restic
sudo test -f /root/.restic/password || sudo sh -c 'head -c 32 /dev/urandom | base64 > /root/.restic/password'
sudo chmod 600 /root/.restic/password
sudo mkdir -p /var/backups/restic
sudo chown root:root /var/backups/restic
# inicializa solo si no existe (no borrará repos existentes)
sudo sh -c 'export RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password; \
if [ -f /var/backups/restic/config ]; then echo "Restic repo existe"; else restic init; fi'
# ejecutar script del panel con las variables
sudo -E RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
# mostrar resultado
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
sudo mkdir -p /root/.restic
sudo test -f /root/.restic/password || sudo sh -c 'head -c 32 /dev/urandom | base64 > /root/.restic/password'
sudo chmod 600 /root/.restic/password
sudo mkdir -p /var/backups/restic
sudo chown root:root /var/backups/restic
sudo -E RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password /usr/local/bin/vps_restic_backup.sh |& tee /tmp/vps-restic-run.log
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
sudo sh -c 'RESTIC_REPOSITORY=/var/backups/restic RESTIC_PASSWORD_FILE=/root/.restic/password /usr/local/bin/vps_restic_backup.sh' |& tee /tmp/vps-restic-run.log
sudo tail -n 200 /tmp/vps-restic-run.log
sudo tail -n 200 /var/log/vps-restic-backup.log || true
git init
git remote add origin https://github.com/mlpadigital/miproyectovps.git
git remote -v
git remote set-url origin https://github.com/mlpadigital/miproyectovps.git
git push -u origin main
git status
git add .
git status
git commit -m "Agrego configuraciones iniciales del VPS"
git push origin main
