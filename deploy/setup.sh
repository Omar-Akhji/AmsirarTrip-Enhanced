#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# AmsirarTrip — Full VPS Setup (Hostinger Ubuntu 22.04/24.04)
# Run as root: sudo bash deploy/setup.sh
# ═══════════════════════════════════════════════════════════════

DOMAIN="amsirartrip.com"
PROJECT_DIR="/opt/amsirartrip"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
EMAIL="admin@$DOMAIN"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  AmsirarTrip — Hostinger VPS Deployment"
echo "  Domain: $DOMAIN"
echo "══════════════════════════════════════════════════════"
echo ""

# ─── 1. System update ─────────────────────────────────────
echo "[1/9] Updating system packages..."
apt update && apt upgrade -y

# ─── 2. Install Docker CE (official script or repo) ───────
echo "[2/9] Checking Docker CE installation..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker Engine and Compose plugin..."
  apt install -y ca-certificates curl gnupg lsb-release
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "[✓] Docker already installed: $(docker --version)"
fi

# Ensure docker compose plugin is available
if ! docker compose version >/dev/null 2>&1; then
  apt update && apt install -y docker-compose-plugin
fi

echo "[✓] Docker Compose version: $(docker compose version)"

# ─── 3. Install Nginx & Certbot ───────────────────────────
echo "[3/9] Installing Nginx & Certbot..."
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx

# ─── 4. Configure firewall (UFW) ──────────────────────────
echo "[4/9] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "[✓] Firewall configured: SSH + HTTP/HTTPS allowed"

# ─── 5. Stop old containers (if any) ──────────────────────
echo "[5/9] Stopping old containers..."
if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR" 2>/dev/null && docker compose down 2>/dev/null || true
fi

# ─── 6. Clone / copy project files ────────────────────────
echo "[6/9] Setting up project directory..."
mkdir -p "$PROJECT_DIR"

CURRENT_DIR="$(pwd -P)"
TARGET_DIR="$(cd "$PROJECT_DIR" 2>/dev/null && pwd -P || echo "$PROJECT_DIR")"

if [ "$CURRENT_DIR" = "$TARGET_DIR" ]; then
  echo "[✓] Running directly inside target project directory ($PROJECT_DIR)"
elif [ -f "./docker-compose.yml" ]; then
  echo "[→] Syncing repository files to $PROJECT_DIR..."
  rsync -av \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.astro' \
    --exclude '.env' \
    ./ "$PROJECT_DIR/"
  echo "[✓] Files synced from current directory to $PROJECT_DIR"
elif [ -d "$PROJECT_DIR/.git" ]; then
  echo "[✓] Existing git repository found in $PROJECT_DIR"
  cd "$PROJECT_DIR" && git pull origin main
else
  echo "[→] Cloning repository into $PROJECT_DIR..."
  git clone https://github.com/Omar-Akhji/AmsirarTrip-Enhanced.git "$PROJECT_DIR"
fi

# ─── 7. Setup Nginx reverse proxy ─────────────────────────
echo "[7/9] Configuring Nginx..."

# Create certbot webroot
mkdir -p /var/www/certbot /etc/nginx/conf.d

# Copy global rate limiting and common HTTP settings
if [ -f "$PROJECT_DIR/nginx/conf.d/amsirartrip-common.conf" ]; then
  cp "$PROJECT_DIR/nginx/conf.d/amsirartrip-common.conf" "/etc/nginx/conf.d/amsirartrip-common.conf"
fi

# Copy Nginx bootstrap config
cp "$PROJECT_DIR/deploy/nginx.conf" "$NGINX_CONF"
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo "[✓] Nginx bootstrap configured and reloaded"

# ─── 8. Get SSL certificate ───────────────────────────────
echo "[8/9] Obtaining SSL certificate via Let's Encrypt..."
certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos --email "$EMAIL" \
  --keep-until-expiring

# Switch Nginx to hardened HTTPS config after SSL is obtained
cp "$PROJECT_DIR/nginx/amsirartrip.com.conf" "$NGINX_CONF"
nginx -t && systemctl reload nginx

# Setup auto-renewal
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew
chmod 644 /etc/cron.d/certbot-renew
echo "[✓] SSL certificate active and auto-renewal configured"

# ─── 9. Build & run containers ────────────────────────────
echo "[9/9] Building and starting containers..."
cd "$PROJECT_DIR"

# Prompt for .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo ""
  echo "══════════════════════════════════════════════════════"
  echo "  ⚠  No .env file found!"
  echo "  Create it from the example:"
  echo "    cp .env.example .env"
  echo "    nano .env"
  echo "  Then run: docker compose up -d --build"
  echo "══════════════════════════════════════════════════════"
  exit 1
fi

docker compose up -d --build

# Wait for health check
echo ""
echo "Waiting for container health check..."
sleep 45

HEALTH=$(docker inspect --format='{{.State.Health.Status}}' amsirartrip 2>/dev/null || echo "unknown")
if [ "$HEALTH" = "healthy" ]; then
  echo "[✓] Container is HEALTHY"
else
  echo "[!] Container health: $HEALTH"
  echo "    Check logs: docker compose logs -f"
fi

# ─── Done ──────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅ Deployment Complete!"
echo ""
echo "  Site:     https://$DOMAIN"
echo "  Logs:     docker compose -f $PROJECT_DIR/docker-compose.yml logs -f"
echo "  Status:   docker compose -f $PROJECT_DIR/docker-compose.yml ps"
echo "  Health:   docker inspect --format='{{.State.Health.Status}}' amsirartrip"
echo "  Update:   bash $PROJECT_DIR/deploy/update.sh"
echo "══════════════════════════════════════════════════════"
