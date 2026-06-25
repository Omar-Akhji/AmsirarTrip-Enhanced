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
echo "[1/4] Pulling latest code..."
git pull

# Rebuild and restart (zero-downtime: build first, then swap)
echo "[2/4] Building new image..."
docker compose build

echo "[3/4] Restarting containers..."
docker compose down
docker compose up -d

# Clean up old images
echo "[4/4] Cleaning up old images..."
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
