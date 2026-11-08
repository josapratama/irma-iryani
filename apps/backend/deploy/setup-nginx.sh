#!/bin/bash
# ============================================================
# Setup Nginx + SSL untuk irma.josapratama.com
# Jalankan setelah deploy-backend.sh
# ============================================================

set -e

SUBDOMAIN="irma.josapratama.com"
EMAIL="josapratama@gmail.com"  # Ganti jika perlu

echo ""
echo "=================================================="
echo "  🌐 Setup Nginx + SSL untuk $SUBDOMAIN"
echo "=================================================="

# ── 1. Konfigurasi Nginx (HTTP dulu) ─────────────────────
echo "⚙️  [1/3] Konfigurasi Nginx..."
cat > /etc/nginx/sites-available/irma-backend << EOF
server {
    listen 80;
    server_name $SUBDOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Aktifkan site
ln -sf /etc/nginx/sites-available/irma-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test dan reload Nginx
nginx -t
systemctl reload nginx
echo "  ✅ Nginx dikonfigurasi"

# ── 2. Verifikasi domain resolve ke VPS ──────────────────
echo ""
echo "🔍 [2/3] Cek DNS..."
RESOLVED_IP=$(dig +short "$SUBDOMAIN" 2>/dev/null | head -1)
VPS_IP="202.155.13.117"

if [ "$RESOLVED_IP" = "$VPS_IP" ]; then
  echo "  ✅ DNS sudah propagasi: $SUBDOMAIN → $RESOLVED_IP"
else
  echo "  ⚠️  DNS belum propagasi. Resolved: '$RESOLVED_IP', Expected: '$VPS_IP'"
  echo "  Tunggu 5–30 menit lagi, lalu jalankan ulang script ini."
  echo "  Atau jalankan manual: certbot --nginx -d $SUBDOMAIN --email $EMAIL --agree-tos --non-interactive"
  exit 1
fi

# ── 3. Install SSL dengan Certbot ────────────────────────
echo ""
echo "🔒 [3/3] Install SSL Let's Encrypt..."
certbot --nginx \
  -d "$SUBDOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive \
  --redirect

# Tutup port 3001 dari luar (hanya Nginx yang akses)
ufw delete allow 3001/tcp 2>/dev/null || true
ufw reload

echo ""
echo "=================================================="
echo "  ✅ SELESAI!"
echo ""
echo "  Backend berjalan di:"
echo "  🌐 https://$SUBDOMAIN"
echo ""
echo "  Test:"
echo "  curl https://$SUBDOMAIN"
echo "  curl https://$SUBDOMAIN/health"
echo "=================================================="
