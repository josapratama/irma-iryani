#!/bin/bash
# ============================================================
# VPS Setup Script untuk irma.josapratama.com
# Ubuntu 24.04 — Node.js + MongoDB + PM2 + Nginx
# Jalankan sebagai root: bash setup-vps.sh
# ============================================================

set -e  # Keluar jika ada error

echo ""
echo "=================================================="
echo "  🚀 Setup VPS irma.josapratama.com"
echo "=================================================="
echo ""

# ── 1. Update sistem ──────────────────────────────────────
echo "📦 [1/7] Update sistem..."
apt-get update -y && apt-get upgrade -y

# ── 2. Install Node.js 22 LTS ─────────────────────────────
echo "📦 [2/7] Install Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version
npm --version

# ── 3. Install PM2 ────────────────────────────────────────
echo "📦 [3/7] Install PM2..."
npm install -g pm2
pm2 --version

# ── 4. Install MongoDB 8 ──────────────────────────────────
echo "📦 [4/7] Install MongoDB 8..."
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  tee /etc/apt/sources.list.d/mongodb-org-8.0.list
apt-get update -y
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
echo "✅ MongoDB status:"
systemctl status mongod --no-pager | head -5

# ── 5. Install Nginx ──────────────────────────────────────
echo "📦 [5/7] Install Nginx..."
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx

# ── 6. Install Certbot ────────────────────────────────────
echo "📦 [6/7] Install Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ── 7. Setup firewall ─────────────────────────────────────
echo "🔒 [7/7] Setup UFW firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp  # Backend port (akan ditutup setelah Nginx setup)
ufw status

echo ""
echo "=================================================="
echo "  ✅ Setup dasar selesai!"
echo "  Lanjut: jalankan deploy-backend.sh"
echo "=================================================="
