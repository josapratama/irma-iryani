import paramiko, time

BACKEND_DIR = "/var/www/irma-backend"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("202.155.13.117", username="root", password="Forum2024Abc!", timeout=15)

def run(cmd, timeout=120):
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = ""
    try:
        while True:
            line = stdout.readline()
            if not line: break
            out += line
            if line.strip():
                print(" ", line.rstrip())
    except Exception:
        pass
    return out

print("=== [1] Verify dir exists ===")
run(f"ls -la {BACKEND_DIR}/")

print("\n=== [2] Buat .env ===")
env_cmd = (
    f"cd {BACKEND_DIR} && "
    "JWT=$(node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\") && "
    "printf 'PORT=3001\\n"
    "MONGODB_URI=mongodb://127.0.0.1:27017/irma_portfolio\\n"
    "JWT_SECRET=%s\\n"
    "JWT_EXPIRES_IN=7d\\n"
    "FRONTEND_URL=https://irma-iryani.vercel.app\\n"
    "NODE_ENV=production\\n"
    "SMTP_HOST=\\n"
    "SMTP_PORT=587\\n"
    "SMTP_USER=\\n"
    "SMTP_PASS=\\n"
    "SMTP_FROM=\\n"
    "SMTP_TO=\\n"
    "' \"$JWT\" > .env && echo 'OK: .env created' && head -3 .env"
)
run(env_cmd, timeout=30)

print("\n=== [3] npm install (NO prune) ===")
run(f"cd {BACKEND_DIR} && npm install 2>&1 | tail -8", timeout=180)

print("\n=== [4] Verify mongoose module ===")
run(f"test -d {BACKEND_DIR}/node_modules/mongoose/lib/types && echo 'mongoose types OK' || echo 'mongoose types MISSING'")
run(f"ls {BACKEND_DIR}/node_modules/mongoose/lib/types/ | head -5")

print("\n=== [5] Restart PM2 ===")
run("pm2 restart irma-backend && sleep 3 && pm2 list")

print("\n=== [6] Test setup admin ===")
time.sleep(2)
run(
    "curl -s -X POST http://localhost:3001/api/auth/setup "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"admin@josapratama.cloud\",\"password\":\"IrmaAdmin2026!\"}'",
    timeout=15
)

print("\n=== [7] Final health check ===")
run("curl -s http://localhost:3001/health")
run("curl -s http://localhost:3001/api/certificates | head -c 100")

client.close()
print("\nDone.")
