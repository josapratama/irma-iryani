#!/bin/bash
# One-shot script — dijalankan langsung di VPS
# curl -fsSL https://raw.githubusercontent.com/josapratama/irma-backend/main/deploy/run-on-vps.sh | bash

set -e
cd /root

echo "📥 Downloading setup scripts..."
curl -fsSL https://raw.githubusercontent.com/josapratama/irma-backend/main/deploy/setup-vps.sh -o setup-vps.sh
curl -fsSL https://raw.githubusercontent.com/josapratama/irma-backend/main/deploy/deploy-backend.sh -o deploy-backend.sh
curl -fsSL https://raw.githubusercontent.com/josapratama/irma-backend/main/deploy/update.sh -o update.sh
chmod +x *.sh

echo "🚀 Running setup-vps.sh..."
bash setup-vps.sh

echo "🚀 Running deploy-backend.sh..."
bash deploy-backend.sh

echo ""
echo "✅ Backend running!"
echo "Test: curl http://localhost:3001/health"
echo ""
echo "⚠️  DNS record masih perlu ditambah manual:"
echo "    Type: A | Name: irma | Value: 202.155.13.117"
echo ""
echo "Setelah DNS propagasi, jalankan SSL:"
echo "    certbot --nginx -d irma.josapratama.com --email you@example.com --agree-tos --non-interactive --redirect"
