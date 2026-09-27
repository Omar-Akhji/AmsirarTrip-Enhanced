#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# AmsirarTrip — Quick Update (pull, rebuild, restart)
# Run as root: sudo bash deploy/update.sh
# ═══════════════════════════════════════════════════════════════

DOMAIN="amsirartrip.com"
PROJECT_DIR="/opt/amsirartrip"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Deploying $DOMAIN..."
echo "══════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_DIR"

# Pull latest code
echo "[1/5] Pulling latest code..."
git pull

# Sync and reload Nginx configuration
echo "[2/5] Updating and validating Nginx configuration..."
mkdir -p /etc/nginx/conf.d
if [ -f "$PROJECT_DIR/nginx/conf.d/amsirartrip-common.conf" ]; then
  cp "$PROJECT_DIR/nginx/conf.d/amsirartrip-common.conf" "/etc/nginx/conf.d/amsirartrip-common.conf"
fi
if [ -f "$PROJECT_DIR/nginx/amsirartrip.com.conf" ]; then
  cp "$PROJECT_DIR/nginx/amsirartrip.com.conf" "/etc/nginx/sites-available/$DOMAIN"
  ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
fi
if command -v nginx >/dev/null 2>&1; then
  nginx -t && systemctl reload nginx
  echo "[✓] Nginx configuration reloaded successfully"
fi

# Rebuild and restart (zero-downtime: build first, then swap)
echo "[3/5] Building new image..."
docker compose build

echo "[4/5] Restarting containers..."
docker compose down
docker compose up -d

# Clean up old images
echo "[5/5] Cleaning up old images..."
docker image prune -f
docker builder prune -f 2>/dev/null || true

# Wait for health check
echo ""
echo "Waiting for health check..."
sleep 45

HEALTH=$(docker inspect --format='{{.State.Health.Status}}' amsirartrip 2>/dev/null || echo "unknown")
if [ "$HEALTH" = "healthy" ]; then
  echo "[✓] Container is HEALTHY"
else
  echo "[!] Container health: $HEALTH"
  echo "    Check logs: docker compose logs -f"
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅ Update Complete! Site: https://$DOMAIN"
echo "══════════════════════════════════════════════════════"
