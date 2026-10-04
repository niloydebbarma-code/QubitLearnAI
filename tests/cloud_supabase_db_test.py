#!/usr/bin/env python3
"""
Supabase Cloud PostgreSQL Database Verification Suite
Platform Verification

Tests live connection to Supabase Cloud PostgreSQL from .env configuration
strictly without fallback local mocks.
"""

import sys
import os
import requests
from dotenv import load_dotenv

# Load configuration strictly from .env
for p in [os.path.join(os.path.dirname(__file__), "..", "qubitlearn-app", ".env"),
          os.path.join(os.path.dirname(__file__), "..", ".env"),
          ".env"]:
    if os.path.exists(p):
        load_dotenv(p, override=False)

def run_test(name, fn):
    try:
        details = fn()
        print(f"[PASS] {name}: {details}", flush=True)
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {e}", flush=True)
        return False

def test_supabase_config():
    sb_url = os.environ.get("SUPABASE_URL", "")
    sb_pub_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
    sb_secret = os.environ.get("SUPABASE_SECRET_KEY", "")
    
    if not (sb_url and (sb_pub_key or sb_secret)):
        raise ValueError("SUPABASE_URL or keys are missing in .env")
        
    return f"URL configured: {bool(sb_url)} | Keys configured: {bool(sb_pub_key or sb_secret)}"

def test_live_supabase_ping():
    sb_url = os.environ.get("SUPABASE_URL", "")
    sb_pub_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
    sb_secret = os.environ.get("SUPABASE_SECRET_KEY", "")
    
    if not sb_url:
        raise ValueError("SUPABASE_URL is not configured")
        
    headers = {}
    if sb_pub_key:
        headers["apikey"] = sb_pub_key
        headers["Authorization"] = f"Bearer {sb_pub_key}"
    elif sb_secret:
        headers["apikey"] = sb_secret
        headers["Authorization"] = f"Bearer {sb_secret}"
        
    res = requests.get(f"{sb_url}/rest/v1/", headers=headers, timeout=5)
    if res.status_code in [200, 204, 401, 404]:
        return f"Endpoint reachable with HTTP {res.status_code}"
    raise RuntimeError(f"Unexpected status HTTP {res.status_code}")

def main():
    print("=" * 80)
    print("SUPABASE CLOUD POSTGRESQL DATABASE VERIFICATION")
    print("=" * 80)
    
    tests = [
        ("Supabase Cloud Environment Configuration", test_supabase_config),
        ("Live Supabase Cloud REST Endpoint Ping", test_live_supabase_ping),
    ]
    
    passed = 0
    for name, fn in tests:
        if run_test(name, fn):
            passed += 1
            
    print("=" * 80)
    print(f"Summary: {passed}/{len(tests)} tests passed")
    print("=" * 80)
    sys.exit(0 if passed == len(tests) else 1)

if __name__ == "__main__":
    main()
