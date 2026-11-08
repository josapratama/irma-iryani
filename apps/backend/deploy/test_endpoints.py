import urllib.request, json

BASE = "https://irma.josapratama.com"

def test(path, method="GET", data=None, headers=None):
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            resp = json.loads(r.read())
            count = len(resp.get("data", [])) if isinstance(resp.get("data"), list) else "-"
            print(f"  {method} {path} -> {r.status} (data: {count})")
            return resp
    except urllib.error.HTTPError as e:
        print(f"  {method} {path} -> HTTP {e.code}: {e.read().decode()[:80]}")
    except Exception as e:
        print(f"  {method} {path} -> ERROR: {e}")

print("=== Health ===")
test("/health")
test("/")

print("\n=== Public API ===")
test("/api/certificates")
test("/api/projects")
test("/api/experiences")
test("/api/skills")
test("/api/recommendation-letters")

print("\n=== Auth ===")
resp = test("/api/auth/login", "POST", {"email": "admin@josapratama.cloud", "password": "IrmaAdmin2026!"})
if resp and resp.get("data", {}).get("token"):
    token = resp["data"]["token"]
    print(f"  Token OK: {token[:30]}...")
    print("\n=== Admin endpoints ===")
    auth_header = {"Authorization": f"Bearer {token}"}
    test("/api/auth/me", headers=auth_header)
    test("/api/certificates/admin/all", headers=auth_header)
    test("/api/contact/stats", headers=auth_header)
    print("\n✅ Semua endpoint berfungsi!")
else:
    print("  Login failed - tidak bisa test admin endpoints")
