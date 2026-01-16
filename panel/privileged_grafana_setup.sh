#!/usr/bin/env bash
set -euo pipefail
echo "[vps-panel] Provisionando dashboards a Grafana (requiere sudo)."

GDIR=/var/lib/grafana/dashboards/vps
PROV_DIR=/etc/grafana/provisioning/dashboards

sudo mkdir -p "$GDIR"
sudo mkdir -p "$PROV_DIR"

echo "-> Copiando JSONs de dashboards"
sudo cp /home/martin/miproyectovps/panel/grafana/*.json "$GDIR/"
sudo chown -R grafana:grafana "$GDIR" || true

echo "-> Creando provider de dashboards"
sudo tee $PROV_DIR/vps-dashboards.yaml > /dev/null <<'YML'
apiVersion: 1
providers:
  - name: 'vps-dashboards'
    orgId: 1
    folder: 'VPS'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards/vps
YML

echo "-> Reiniciando Grafana"
sudo systemctl restart grafana-server || true
sudo systemctl status grafana-server --no-pager -l || true

echo "[vps-panel] Dashboards provisionados. Abre Grafana en el puerto 3000 (o el que uses) para verlos." 
