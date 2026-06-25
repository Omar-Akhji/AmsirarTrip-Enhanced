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

# ─── 2. Install Docker CE (official repo) ─────────────────
echo "[2/9] Installing Docker CE from official repository..."
apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Docker on boot
systemctl enable docker
systemctl start docker

# Verify Docker installation
echo "[✓] Docker version: $(docker --version)"
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
cd "$PROJECT_DIR" 2>/dev/null && docker compose down 2>/dev/null || true

# ─── 6. Clone / copy project files ────────────────────────
echo "[6/9] Setting up project directory..."
mkdir -p "$PROJECT_DIR"

# If this is run from the project root (local copy)
if [ -f "./docker-compose.yml" ]; then
  rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.astro' \
    --exclude '.env' \
    ./ "$PROJECT_DIR/"
  echo "[✓] Files copied from local directory"
else
  echo "[!] Run this script from the project root, or clone your repo to $PROJECT_DIR"
  echo "    Example: git clone https://github.com/YOUR_USER/AmsirarTrip-Enhanced.git $PROJECT_DIR"
fi

# ─── 7. Setup Nginx reverse proxy ─────────────────────────
echo "[7/9] Configuring Nginx..."

# Create certbot webroot
mkdir -p /var/www/certbot

# Copy Nginx config
cp "$PROJECT_DIR/deploy/nginx.conf" "$NGINX_CONF"
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo "[✓] Nginx configured and reloaded"

# ─── 8. Get SSL certificate ───────────────────────────────
echo "[8/9] Obtaining SSL certificate..."
certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos --email "$EMAIL"

# Switch Nginx to HTTPS config after SSL is obtained
cp "$PROJECT_DIR/nginx/amsirartrip.com.conf" "$NGINX_CONF"
nginx -t && systemctl reload nginx

# Setup auto-renewal
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew
chmod 644 /etc/cron.d/certbot-renew
echo "[✓] SSL certificate obtained and auto-renewal configured"

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
