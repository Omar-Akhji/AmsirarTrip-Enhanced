#!/bin/bash
set -e

DOMAIN="amsirartrip.com"
PROJECT_DIR="/opt/amsirartrip"

echo "=== Deploying $DOMAIN ==="

cd "$PROJECT_DIR"

# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Clean up old images
docker image prune -f

echo "=== Done! Site: https://$DOMAIN ==="
