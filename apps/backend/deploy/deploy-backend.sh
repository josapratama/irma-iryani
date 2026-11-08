#!/bin/bash
# ============================================================
# Deploy Backend Script
# Jalankan setelah setup-vps.sh selesai
# Jalankan sebagai root: bash deploy-backend.sh
# ============================================================

set -e

APP_DIR="/var/www/irma-backend"
REPO_URL="https://github.com/josapratama/irma-backend.git"
SUBDOMAIN="irma.josapratama.com"

echo ""
echo "=================================================="
echo "  🚀 Deploy irma-backend"
echo "=================================================="

# ── 1. Clone atau pull repository ─────────────────────────
echo "📥 [1/5] Clone repository..."
if [ -d "$APP_DIR" ]; then
  echo "  → Directory sudah ada, pull terbaru..."
  cd "$APP_DIR/backend"
  git pull origin main
else
  echo "  → Clone baru..."
  mkdir -p /var/www
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR/backend"
fi

# ── 2. Install dependencies ───────────────────────────────
echo "📦 [2/5] Install dependencies & build..."
cd "$APP_DIR/backend"
npm install          # install semua — JANGAN prune, mongoose butuh semua module
npm run build        # compile TypeScript

# ── 3. Buat .env jika belum ada ───────────────────────────
echo "⚙️  [3/5] Setup .env..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
  # Generate JWT secret acak
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

  cat > "$APP_DIR/backend/.env" << EOF
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/irma_portfolio
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_TO=
FRONTEND_URL=https://irma-iryani.vercel.app
NODE_ENV=production
EOF
  echo "  → .env dibuat. JWT_SECRET sudah di-generate otomatis."
  echo "  ⚠️  Isi SMTP_ dan FRONTEND_URL setelah deploy jika diperlukan."
else
  echo "  → .env sudah ada, skip."
fi

# ── 4. Build TypeScript ───────────────────────────────────
echo "🔨 [4/5] Build TypeScript..."
cd "$APP_DIR/backend"
npm run build

# ── 5. Start / restart dengan PM2 ────────────────────────
echo "🟢 [5/5] Start backend dengan PM2..."
cd "$APP_DIR/backend"

# Buat PM2 ecosystem config
cat > "$APP_DIR/backend/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'irma-backend',
    script: 'dist/index.js',
    cwd: '/var/www/irma-backend/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/irma-backend/error.log',
    out_file: '/var/log/irma-backend/out.log',
    time: true,
  }]
}
EOF

mkdir -p /var/log/irma-backend

# Stop jika sudah berjalan
pm2 stop irma-backend 2>/dev/null || true
pm2 delete irma-backend 2>/dev/null || true

# Start
pm2 start "$APP_DIR/backend/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash 2>/dev/null || true

echo ""
echo "✅ Backend berjalan di port 3001"
echo "   Test: curl http://localhost:3001"
pm2 list
