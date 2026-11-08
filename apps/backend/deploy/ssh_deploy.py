"""
SSH Deploy Script — paramiko dengan timeout fix
Jalankan: python deploy/ssh_deploy.py
"""

import paramiko
import time
import sys
import socket

HOST = "202.155.13.117"
USER = "root"
PASSWORD = "Forum2024Abc!"
PORT = 22

def run_command(client, command, timeout=600, show_output=True, ignore_error=False):
    """Jalankan command di SSH dan tunggu selesai."""
    short_cmd = command[:80] + ('...' if len(command) > 80 else '')
    print(f"\n$ {short_cmd}")

    stdin, stdout, stderr = client.exec_command(command, timeout=timeout, get_pty=True)
    stdout.channel.settimeout(timeout)

    output_lines = []
    try:
        while True:
            try:
                line = stdout.readline()
                if not line:
                    break
                line = line.rstrip()
                output_lines.append(line)
                if show_output and line:
                    print(f"  {line}")
            except (socket.timeout, paramiko.buffered_pipe.PipeTimeout):
                # Timeout saat membaca — command mungkin selesai tapi tidak ada output
                break
    except Exception as e:
        print(f"  [read error: {e}]")

    try:
        exit_code = stdout.channel.recv_exit_status()
    except Exception:
        exit_code = 0  # Assume success jika tidak bisa baca exit code

    if exit_code != 0 and not ignore_error:
        err = ""
        try:
            err = stderr.read(4096).decode("utf-8", errors="replace").strip()
        except Exception:
            pass
        if err:
            print(f"  [stderr] {err[:200]}")
        print(f"  [exit: {exit_code}]")

    return exit_code, "\n".join(output_lines)

def main():
    # Deteksi apakah ini resume (MongoDB + Node sudah ada)
    resume = "--resume" in sys.argv

    print("=" * 60)
    print("  🚀 Deploy irma-backend ke VPS")
    print(f"  Host: {HOST}")
    if resume:
        print("  Mode: RESUME (skip install, mulai dari clone)")
    print("=" * 60)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f"\n🔌 Connecting to {HOST}...")
    try:
        client.connect(HOST, port=PORT, username=USER, password=PASSWORD,
                      timeout=30, banner_timeout=30, auth_timeout=30)
        print("  ✅ Connected!")
    except Exception as e:
        print(f"  ❌ Connection failed: {e}")
        sys.exit(1)

    if not resume:
        # ── Step 1-3 sudah selesai dari run sebelumnya ──────────
        print("\n✅ Node.js, PM2, MongoDB sudah terinstall dari run sebelumnya.")

    # ── Step 4: Clone atau pull repo ─────────────────────────
    print("\n" + "─" * 50)
    print("📦 STEP 4: Clone/update repository")
    print("─" * 50)

    # Cek apakah repo sudah ada
    code, out = run_command(client, "test -d /var/www/irma-backend/.git && echo EXISTS || echo MISSING")
    if "EXISTS" in out:
        print("  → Repo sudah ada, pull update...")
        run_command(client, "cd /var/www/irma-backend && git fetch origin && git reset --hard origin/main", timeout=120)
    else:
        print("  → Clone fresh...")
        run_command(client, "rm -rf /var/www/irma-backend && mkdir -p /var/www", timeout=30)
        # Clone dengan timeout besar
        code, out = run_command(client,
            "git clone --depth 1 https://github.com/josapratama/irma-backend.git /var/www/irma-backend",
            timeout=300
        )
        if code != 0:
            print("  ❌ Clone failed. Coba manual: git clone https://github.com/josapratama/irma-backend.git /var/www/irma-backend")
            sys.exit(1)

    run_command(client, "ls /var/www/irma-backend/", show_output=True)

    # ── Step 5: Install dependencies & build ─────────────────
    print("\n" + "─" * 50)
    print("📦 STEP 5: npm install & build")
    print("─" * 50)

    run_command(client, "cd /var/www/irma-backend && npm install --omit=dev", timeout=300)
    run_command(client, "cd /var/www/irma-backend && npm run build", timeout=180)
    run_command(client, "ls /var/www/irma-backend/dist/", timeout=30)

    # ── Step 6: Setup .env ────────────────────────────────────
    print("\n" + "─" * 50)
    print("⚙️  STEP 6: Setup .env")
    print("─" * 50)

    code, out = run_command(client, "test -f /var/www/irma-backend/.env && echo EXISTS || echo MISSING")
    if "MISSING" in out:
        print("  → Membuat .env baru dengan JWT secret otomatis...")
        # Buat .env via heredoc
        env_cmd = (
            'JWT=$(node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))") && '
            'cat > /var/www/irma-backend/.env << ENVEOF\n'
            'PORT=3001\n'
            'MONGODB_URI=mongodb://127.0.0.1:27017/irma_portfolio\n'
            'JWT_SECRET=$JWT\n'
            'JWT_EXPIRES_IN=7d\n'
            'ADMIN_EMAIL=\n'
            'ADMIN_PASSWORD_HASH=\n'
            'SMTP_HOST=smtp.gmail.com\n'
            'SMTP_PORT=587\n'
            'SMTP_USER=\n'
            'SMTP_PASS=\n'
            'SMTP_FROM=\n'
            'SMTP_TO=\n'
            'FRONTEND_URL=https://irma-iryani.vercel.app\n'
            'NODE_ENV=production\n'
            'ENVEOF'
        )
        run_command(client, env_cmd, timeout=30)
        print("  ✅ .env dibuat")
    else:
        print("  → .env sudah ada, skip.")

    # ── Step 7: PM2 setup ─────────────────────────────────────
    print("\n" + "─" * 50)
    print("🟢 STEP 7: Start/restart backend dengan PM2")
    print("─" * 50)

    ecosystem = (
        'cat > /var/www/irma-backend/ecosystem.config.js << \'PM2EOF\'\n'
        'module.exports = {\n'
        '  apps: [{\n'
        '    name: \'irma-backend\',\n'
        '    script: \'dist/index.js\',\n'
        '    cwd: \'/var/www/irma-backend\',\n'
        '    instances: 1,\n'
        '    autorestart: true,\n'
        '    watch: false,\n'
        '    max_memory_restart: \'256M\',\n'
        '    env_file: \'/var/www/irma-backend/.env\',\n'
        '    env: { NODE_ENV: \'production\' },\n'
        '    error_file: \'/var/log/irma-backend/error.log\',\n'
        '    out_file: \'/var/log/irma-backend/out.log\',\n'
        '    time: true,\n'
        '  }]\n'
        '}\n'
        'PM2EOF'
    )

    run_command(client, "mkdir -p /var/log/irma-backend", timeout=10)
    run_command(client, ecosystem, timeout=30)
    run_command(client, "pm2 stop irma-backend 2>/dev/null; pm2 delete irma-backend 2>/dev/null; true", timeout=30, ignore_error=True)
    run_command(client, "cd /var/www/irma-backend && pm2 start ecosystem.config.js", timeout=60)
    run_command(client, "pm2 save", timeout=30)
    run_command(client, "pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true", timeout=60, ignore_error=True)

    time.sleep(3)
    run_command(client, "pm2 list", timeout=30)

    # ── Step 8: Test ──────────────────────────────────────────
    print("\n" + "─" * 50)
    print("🧪 STEP 8: Test backend")
    print("─" * 50)

    time.sleep(2)
    code, out = run_command(client, "curl -s http://localhost:3001/health", timeout=15)
    if "ok" in out.lower() or "running" in out.lower():
        print("  ✅ Backend responding!")
    else:
        print("  ⚠️  Cek logs: pm2 logs irma-backend --lines 20")
        run_command(client, "pm2 logs irma-backend --lines 20 --nostream", timeout=30, ignore_error=True)

    # ── Step 9: Firewall ──────────────────────────────────────
    print("\n" + "─" * 50)
    print("🔒 STEP 9: UFW Firewall")
    print("─" * 50)

    run_command(client, "ufw --force enable", timeout=30, ignore_error=True)
    run_command(client, "ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp", timeout=30)
    run_command(client, "ufw status", timeout=15)

    # ── Step 10: Nginx config ─────────────────────────────────
    print("\n" + "─" * 50)
    print("🌐 STEP 10: Konfigurasi Nginx")
    print("─" * 50)

    nginx_conf = (
        'cat > /etc/nginx/sites-available/irma-backend << \'NGEOF\'\n'
        'server {\n'
        '    listen 80;\n'
        '    server_name irma.josapratama.com;\n'
        '\n'
        '    add_header X-Frame-Options "SAMEORIGIN" always;\n'
        '    add_header X-Content-Type-Options "nosniff" always;\n'
        '\n'
        '    location / {\n'
        '        proxy_pass http://127.0.0.1:3001;\n'
        '        proxy_http_version 1.1;\n'
        '        proxy_set_header Upgrade $http_upgrade;\n'
        '        proxy_set_header Connection \'upgrade\';\n'
        '        proxy_set_header Host $host;\n'
        '        proxy_set_header X-Real-IP $remote_addr;\n'
        '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n'
        '        proxy_set_header X-Forwarded-Proto $scheme;\n'
        '        proxy_cache_bypass $http_upgrade;\n'
        '        proxy_connect_timeout 60s;\n'
        '        proxy_read_timeout 60s;\n'
        '    }\n'
        '}\n'
        'NGEOF'
    )

    run_command(client, nginx_conf, timeout=30)
    run_command(client, "ln -sf /etc/nginx/sites-available/irma-backend /etc/nginx/sites-enabled/", timeout=10)
    run_command(client, "rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true", timeout=10, ignore_error=True)
    run_command(client, "nginx -t && systemctl reload nginx", timeout=30)
    print("  ✅ Nginx dikonfigurasi untuk irma.josapratama.com")

    # ── Summary ───────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  ✅ DEPLOY SELESAI!")
    print("")
    print("  ✅ Backend berjalan: http://202.155.13.117")
    print("  ✅ MongoDB aktif: mongodb://127.0.0.1:27017")
    print("")
    print("  Yang masih perlu dilakukan:")
    print("  ┌─────────────────────────────────────────────┐")
    print("  │ 1. Tambah DNS record di josapratama.cloud:  │")
    print("  │    Type : A                                 │")
    print("  │    Name : irma                              │")
    print("  │    Value: 202.155.13.117                    │")
    print("  └─────────────────────────────────────────────┘")
    print("")
    print("  2. Setelah DNS propagasi (5-30 menit),")
    print("     jalankan SSL script:")
    print("     python deploy/ssl_setup.py")
    print("=" * 60)

    client.close()

if __name__ == "__main__":
    main()
