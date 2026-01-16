#!/bin/bash
# Plantilla de backup con restic. Configura las variables abajo antes de usar.
# Ejemplo mínimo:
# export RESTIC_REPOSITORY="/path/to/repo"
# export RESTIC_PASSWORD="mi-clave-secreta"
# export RESTIC_PASSWORD_FILE="/root/.restic_pw"

set -e

if [ -z "$RESTIC_REPOSITORY" ]; then
  echo "ERROR: RESTIC_REPOSITORY no está configurado. Exporta la variable y vuelve a ejecutar." >&2
  exit 1
fi

if [ -z "$RESTIC_PASSWORD" ] && [ ! -f "$RESTIC_PASSWORD_FILE" ]; then
  echo "ERROR: RESTIC_PASSWORD o RESTIC_PASSWORD_FILE no definidos." >&2
  exit 1
fi

export RESTIC_PASSWORD=${RESTIC_PASSWORD:-$(cat "$RESTIC_PASSWORD_FILE")}

restic backup /etc /home/martin/miproyectovps || exit 2
restic forget --prune --keep-daily 7 --keep-weekly 4 --keep-monthly 6 || true

echo "Backup completado: $(date -Iseconds)"
