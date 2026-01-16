#!/usr/bin/env bash
set -euo pipefail
echo "[vps-panel] Configurando Alertmanager, reglas y receptor local (log-only)."

echo "-> Instalando Alertmanager desde release oficial (si no está en apt)"
sudo apt update
# Intentar apt primero
if ! apt-cache policy alertmanager | grep -q 'Candidate:'; then
  echo "alertmanager no disponible en apt, instalando desde release..."
  LATEST=$(curl -s https://api.github.com/repos/prometheus/alertmanager/releases/latest | grep -Po '"tag_name":\s*"\K(.*)(?=")')
  ARCHIVE="alertmanager-${LATEST#v}.linux-amd64.tar.gz"
  curl -sL "https://github.com/prometheus/alertmanager/releases/download/${LATEST}/${ARCHIVE}" -o /tmp/${ARCHIVE}
  tar -xzf /tmp/${ARCHIVE} -C /tmp
  sudo cp /tmp/alertmanager-${LATEST#v}.linux-amd64/alertmanager /usr/local/bin/
  sudo cp /tmp/alertmanager-${LATEST#v}.linux-amd64/amtool /usr/local/bin/
  sudo chmod 755 /usr/local/bin/alertmanager /usr/local/bin/amtool
  sudo useradd --no-create-home --shell /usr/sbin/nologin alertmanager || true
  sudo mkdir -p /etc/alertmanager /var/lib/alertmanager
  sudo chown alertmanager:alertmanager /etc/alertmanager /var/lib/alertmanager
else
  echo "alertmanager disponible en apt, instalando paquete"
  sudo apt install -y alertmanager || true
fi

echo "-> Instalando dependencias de receptor (express)"
cd /home/martin/miproyectovps/panel
sudo -u martin npm install express --no-audit --no-fund || true

echo "-> Copiando reglas a /etc/prometheus/rules.d/"
sudo mkdir -p /etc/prometheus/rules.d
sudo cp /home/martin/miproyectovps/panel/alert_rules.yml /etc/prometheus/rules.d/vps-rules.yml

echo "-> Configurando Alertmanager para webhook a receptor local"
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

echo "-> Creando unit systemd para alert_receiver.js"
sudo tee /etc/systemd/system/vps-alert-receiver.service > /dev/null <<'UNIT'
[Unit]
Description=VPS Alert Receiver (writes to log)
After=network.target

[Service]
Type=simple
User=martin
WorkingDirectory=/home/martin/miproyectovps/panel
ExecStart=/usr/bin/node /home/martin/miproyectovps/panel/alert_receiver.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
UNIT

echo "-> Asegurando permisos de log"
sudo touch /var/log/vps-alerts.log
sudo chown martin:adm /var/log/vps-alerts.log || true
sudo chmod 640 /var/log/vps-alerts.log || true

echo "-> Habilitando y arrancando servicios"
sudo systemctl daemon-reload
sudo systemctl enable --now vps-alert-receiver.service || true
sudo systemctl enable --now alertmanager || true

echo "-> Configurando Prometheus para usar las reglas y Alertmanager"
if ! grep -q "rule_files" /etc/prometheus/prometheus.yml 2>/dev/null; then
  sudo sed -i '1i rule_files:\n  - "/etc/prometheus/rules.d/*.yml"\n' /etc/prometheus/prometheus.yml || true
fi
if ! grep -q "alerting:" /etc/prometheus/prometheus.yml 2>/dev/null; then
  sudo tee -a /etc/prometheus/prometheus.yml > /dev/null <<'YML'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
YML
fi

sudo systemctl restart prometheus || true
sudo systemctl status prometheus --no-pager -l || true
sudo systemctl status alertmanager --no-pager -l || true
sudo systemctl status vps-alert-receiver --no-pager -l || true

echo "[vps-panel] Configuración de alertas completada. Revisa /var/log/vps-alerts.log para las alertas recibidas."
