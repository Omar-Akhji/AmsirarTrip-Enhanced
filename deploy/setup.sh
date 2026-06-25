#!/bin/bash
set -e

DOMAIN="amsirartrip.com"
PROJECT_DIR="/opt/amsirartrip"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "=== AmsirarTrip Deployment ==="

# ─── 1. Install dependencies ───────────────────────────────
echo "[1/7] Installing Docker & Nginx..."
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
systemctl enable docker nginx

# ─── 2. Stop old Next.js project ───────────────────────────
echo "[2/7] Stopping old Next.js containers..."
cd "$PROJECT_DIR" 2>/dev/null && docker compose down 2>/dev/null || true

# ─── 3. Copy project files ─────────────────────────────────
echo "[3/7] Copying project files..."
mkdir -p "$PROJECT_DIR"
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.astro' \
  ./ "$PROJECT_DIR/"

# ─── 4. Setup Nginx ────────────────────────────────────────
echo "[4/7] Configuring Nginx..."
cp deploy/nginx.conf "$NGINX_CONF"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ─── 5. Get SSL certificate ────────────────────────────────
echo "[5/7] Setting up SSL..."
certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos --email "admin@$DOMAIN"

# ─── 6. Auto-renew SSL ─────────────────────────────────────
echo "[6/7] Setting up SSL auto-renewal..."
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew

# ─── 7. Build & run ────────────────────────────────────────
echo "[7/7] Building and starting containers..."
cd "$PROJECT_DIR"
docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo "=== Done! ==="
echo "Site: https://$DOMAIN"
echo "Logs: docker compose -f $PROJECT_DIR/docker-compose.yml logs -f"
