# Deploy Guide — irma.josapratama.com

## Status

✅ **Backend live:** https://irma.josapratama.com  
✅ **SSL:** Let's Encrypt (auto-renew)  
✅ **MongoDB:** local di VPS  
✅ **PM2:** auto-start on reboot

---

## Info VPS

- IP: 202.155.13.117
- OS: Ubuntu 24.04
- Subdomain: irma.josapratama.com

---

## Cara update kode (setelah deploy pertama)

SSH ke VPS lalu jalankan:

```bash
cd /var/www/irma-backend
git pull origin main
npm install
npm run build
pm2 restart irma-backend
pm2 save
```

Atau pakai script:

```bash
bash /var/www/irma-backend/deploy/update.sh
```

---

## Deploy pertama (fresh VPS)

### 1. Tambah DNS Record

Di panel domain josapratama.cloud → DNS Management:

```
Type : A  |  Name : irma  |  Value: 202.155.13.117  |  TTL: 300
```

### 2. SSH ke VPS

```bash
ssh root@202.155.13.117
```

### 3. Install dependencies

```bash
apt-get update -y
apt-get install -y git curl nginx certbot python3-certbot-nginx ufw

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
npm install -g pm2

# MongoDB 8
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list
apt-get update -y && apt-get install -y mongodb-org
systemctl start mongod && systemctl enable mongod
```

### 4. Clone dan setup backend

```bash
cd /var/www
git clone https://github.com/josapratama/irma-backend.git irma-backend
cd irma-backend
npm install
npm run build

# Buat .env
JWT=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
cat > /var/www/irma-backend/.env << EOF
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/irma_portfolio
JWT_SECRET=$JWT
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://irma-iryani.vercel.app
NODE_ENV=production
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_TO=
EOF
```

### 5. Start dengan PM2

```bash
mkdir -p /var/log/irma-backend
cat > /var/www/irma-backend/ecosystem.config.js << 'PM2EOF'
module.exports = { apps: [{ name: 'irma-backend', script: 'dist/index.js', cwd: '/var/www/irma-backend', autorestart: true, env_file: '/var/www/irma-backend/.env', env: { NODE_ENV: 'production' }, error_file: '/var/log/irma-backend/error.log', out_file: '/var/log/irma-backend/out.log', time: true }] }
PM2EOF
pm2 start ecosystem.config.js
pm2 startup systemd -u root --hp /root
pm2 save
```

### 6. Nginx + SSL

```bash
# Nginx config
cat > /etc/nginx/sites-available/irma-backend << 'NGEOF'
server {
    listen 80;
    server_name irma.josapratama.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGEOF
ln -sf /etc/nginx/sites-available/irma-backend /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d irma.josapratama.com --email josapratama1234@gmail.com --agree-tos --non-interactive --redirect

# Firewall
ufw --force enable && ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp
```

### 7. Setup admin (sekali saja)

```bash
curl -X POST https://irma.josapratama.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@josapratama.cloud","password":"IrmaAdmin2026!"}'
```

---

## Cek status

```bash
pm2 list                 # Status proses
pm2 logs irma-backend    # Lihat logs realtime
systemctl status mongod  # Status MongoDB
systemctl status nginx   # Status Nginx
curl https://irma.josapratama.com/health  # Test API
```

---

## Lokasi file penting

```
/var/www/irma-backend/          # Kode backend
/var/www/irma-backend/.env      # Environment variables (JANGAN commit)
/etc/nginx/sites-available/irma-backend  # Nginx config
/var/log/irma-backend/          # Log files PM2
```

---

## Credentials Admin

- Email: admin@josapratama.cloud
- Password: _(tersimpan aman, jangan share)_

---

## Test semua endpoint

```bash
python deploy/test_endpoints.py
```
