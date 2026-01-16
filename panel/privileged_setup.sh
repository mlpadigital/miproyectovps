#!/usr/bin/env bash
set -euo pipefail
echo "[vps-panel] Iniciando script privilegiado..."

echo "-> Actualizando Nginx para usar puerto 3001"
if [ -f /etc/nginx/sites-available/panel.mlpadigital.com.conf ]; then
  sudo sed -i 's/127.0.0.1:3000/127.0.0.1:3001/g' /etc/nginx/sites-available/panel.mlpadigital.com.conf || true
  sudo nginx -t
  sudo systemctl reload nginx
else
  echo "No se encontró /etc/nginx/sites-available/panel.mlpadigital.com.conf, omitiendo" >&2
fi

echo "-> Instalando/actualizando unidad systemd del panel"
sudo tee /etc/systemd/system/vps-panel.service > /dev/null <<'UNIT'
[Unit]
Description=VPS Panel (simple)
After=network.target

[Service]
Type=simple
User=martin
WorkingDirectory=/home/martin/miproyectovps/panel
ExecStart=/usr/bin/node /home/martin/miproyectovps/panel/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now vps-panel.service || true
sudo systemctl status vps-panel --no-pager -l -n 50 || true

echo "-> Creando script de backup Restic (/usr/local/bin/vps_restic_backup.sh)"
sudo tee /usr/local/bin/vps_restic_backup.sh > /dev/null <<'BASH'
#!/usr/bin/env bash
set -euo pipefail
LOG=/var/log/vps-restic-backup.log
echo "=== Backup started $(date -u) ===" >> "$LOG"
if [ -z "${RESTIC_REPOSITORY:-}" ]; then
  echo "RESTIC_REPOSITORY not set" | tee -a "$LOG"
  exit 2
fi
if [ -z "${RESTIC_PASSWORD_FILE:-}" ]; then
  echo "RESTIC_PASSWORD_FILE not set" | tee -a "$LOG"
  exit 2
fi
export RESTIC_REPOSITORY RESTIC_PASSWORD_FILE
restic backup /etc /home/martin --exclude=/home/martin/.cache --verbose >> "$LOG" 2>&1 || true
restic forget --keep-daily 7 --keep-weekly 4 --prune >> "$LOG" 2>&1 || true
echo "=== Backup finished $(date -u) ===" >> "$LOG"
BASH

sudo chmod 750 /usr/local/bin/vps_restic_backup.sh
sudo chown root:root /usr/local/bin/vps_restic_backup.sh

echo "-> Añadiendo sudoers para permitir ejecutar el backup sin contraseña"
echo 'martin ALL=(root) NOPASSWD: /usr/local/bin/vps_restic_backup.sh' | sudo tee /etc/sudoers.d/vps-panel-backup
sudo chmod 440 /etc/sudoers.d/vps-panel-backup

echo "-> Creando unidad y timer systemd para backups diarios"
sudo tee /etc/systemd/system/vps-restic-backup.service > /dev/null <<'UNIT'
[Unit]
Description=VPS Restic backup
Wants=vps-restic-backup.timer

[Service]
Type=oneshot
User=root
ExecStart=/usr/local/bin/vps_restic_backup.sh
RemainAfterExit=no
UNIT

sudo tee /etc/systemd/system/vps-restic-backup.timer > /dev/null <<'UNIT'
[Unit]
Description=Run vps-restic-backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now vps-restic-backup.timer || true
sudo systemctl status vps-restic-backup.timer --no-pager -l || true

echo "-> Instalando Prometheus, node_exporter y Grafana"
sudo apt update
sudo apt install -y prometheus prometheus-node-exporter apt-transport-https software-properties-common wget gnupg
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add - || true
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main" || true
sudo apt update
sudo apt install -y grafana || true
sudo systemctl enable --now grafana-server || true
sudo systemctl enable --now prometheus || true

echo "-> Configurando Prometheus para scrapear node_exporter y panel (/metrics)"
if [ -f /etc/prometheus/prometheus.yml ]; then
  sudo cp /etc/prometheus/prometheus.yml /etc/prometheus/prometheus.yml.bak || true
fi
sudo tee /etc/prometheus/prometheus.yml > /dev/null <<'YML'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'vps_panel'
    metrics_path: /metrics
    static_configs:
      - targets: ['localhost:3001']
YML

sudo systemctl restart prometheus || true
sudo systemctl status prometheus --no-pager -l || true

echo "-> Provisionando datasource de Grafana (Prometheus)"
sudo mkdir -p /etc/grafana/provisioning/datasources
sudo tee /etc/grafana/provisioning/datasources/prometheus.yml > /dev/null <<'YML'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
YML

sudo systemctl restart grafana-server || true

echo "[vps-panel] Script privilegiado finalizado. Revisa la salida para errores." 
echo "Si quieres, pega aquí la salida de este script y continúo con la configuración fina (dashboards, alertas, integraciones)."
