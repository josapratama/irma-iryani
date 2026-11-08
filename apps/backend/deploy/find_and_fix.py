import paramiko, time, sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("202.155.13.117", username="root", password="Forum2024Abc!", timeout=15)

def run(cmd, timeout=60):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = ""
    try:
        while True:
            line = stdout.readline()
            if not line: break
            out += line
            if line.strip():
                print(" ", line.rstrip())
    except Exception as e:
        pass
    return out

print("=== [1] Cari lokasi backend ===")
out1 = run("find /root /var /home -maxdepth 6 -name 'package.json' 2>/dev/null | xargs grep -l 'irma-portfolio' 2>/dev/null")
run("find /root /var /home -maxdepth 6 -name 'ecosystem.config.js' 2>/dev/null")

print("\n=== [2] pm2 show ===")
run("pm2 show irma-backend 2>&1 | head -20")

# Tentukan path dari output
import re
paths = re.findall(r'(/[\w/.-]+)(?:package\.json|ecosystem)', out1)
backend_dir = None
for p in paths:
    backend_dir = p.rstrip('/')
    break

if not backend_dir:
    # Fallback — cek dari pm2
    out2 = run("pm2 show irma-backend 2>&1")
    m = re.search(r'exec cwd\s+\│\s+(\S+)', out2)
    if m:
        backend_dir = m.group(1)

print(f"\n=== Backend dir: {backend_dir} ===")

if backend_dir:
    print("\n=== [3] Buat .env ===")
    run(f"test -f {backend_dir}/.env && echo 'EXISTS' || echo 'MISSING'")

    env_cmd = (
        f'JWT=$(node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))") && '
        f'cat > {backend_dir}/.env << ENVEOF\n'
        f'PORT=3001\n'
        f'MONGODB_URI=mongodb://127.0.0.1:27017/irma_portfolio\n'
        f'JWT_SECRET=$JWT\n'
        f'JWT_EXPIRES_IN=7d\n'
        f'FRONTEND_URL=https://irma-iryani.vercel.app\n'
        f'NODE_ENV=production\n'
        f'SMTP_HOST=\n'
        f'SMTP_PORT=587\n'
        f'SMTP_USER=\n'
        f'SMTP_PASS=\n'
        f'SMTP_FROM=\n'
        f'SMTP_TO=\n'
        f'ENVEOF'
    )
    run(env_cmd, timeout=30)
    run(f"head -3 {backend_dir}/.env")

    print("\n=== [4] npm install (tanpa prune) ===")
    run(f"cd {backend_dir} && npm install 2>&1 | tail -5", timeout=120)

    print("\n=== [5] Restart PM2 ===")
    run("pm2 restart irma-backend")
    time.sleep(3)

    print("\n=== [6] Test setup admin ===")
    run(
        "curl -s -X POST http://localhost:3001/api/auth/setup "
        "-H 'Content-Type: application/json' "
        "-d '{\"email\":\"admin@josapratama.cloud\",\"password\":\"IrmaAdmin2026!\"}'",
        timeout=15
    )

    print("\n=== [7] Test certificates API ===")
    run("curl -s http://localhost:3001/api/certificates", timeout=10)
else:
    print("ERROR: Tidak bisa menemukan backend dir!")
    print("Jalankan manual: find / -name 'package.json' | xargs grep -l 'irma' 2>/dev/null")

client.close()
