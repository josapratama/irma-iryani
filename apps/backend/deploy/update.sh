#!/bin/bash
# ============================================================
# Update Backend — jalankan setiap kali ada perubahan kode
# Usage: bash /var/www/irma-backend/deploy/update.sh
# ============================================================

set -e

APP_DIR="/var/www/irma-backend"

echo "🔄 Updating irma-backend..."

cd "$APP_DIR"
git pull origin main
npm install          # install semua termasuk devDeps untuk build
npm run build
npm prune --omit=dev # baru hapus devDeps setelah build

pm2 restart irma-backend
pm2 list

echo "✅ Backend updated!"
echo "   curl https://irma.josapratama.com/health"
