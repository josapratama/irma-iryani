import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("202.155.13.117", username="root", password="Forum2024Abc!", timeout=15)

def run(cmd, timeout=30):
    _, stdout, _ = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    print(out.strip())
    return out

print("=== PID dan CWD ===")
run("cat /root/.pm2/pids/irma-backend-1.pid | xargs -I{} ls -la /proc/{}/cwd 2>/dev/null || echo 'pid read failed'")

print("\n=== Find semua dist/index.js ===")
run("find / -name 'index.js' -path '*/dist/*' 2>/dev/null | grep -v node_modules | head -10")

print("\n=== Find package.json dengan nama irma ===")
run("find / -name 'package.json' 2>/dev/null | xargs grep -l 'irma-portfolio' 2>/dev/null | head -5")

print("\n=== pm2 env 1 ===")
run("pm2 env 1 2>&1 | grep -E 'PWD|cwd|root|PM2_CWD' | head -10")

print("\n=== ls /var/www/ ===")
run("ls -la /var/www/ 2>&1")

print("\n=== df -h ===")
run("df -h | head -5")

client.close()
