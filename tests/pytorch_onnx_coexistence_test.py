#!/usr/bin/env python3
"""
PyTorch & ONNX Process Coexistence Verification Suite
Platform Verification

Tests importing and executing PyTorch and ONNX Runtime in process isolation
to ensure zero Windows C++ dynamic link library collisions.
"""

import sys
import subprocess

def run_test(name, fn):
    try:
        details = fn()
        print(f"[PASS] {name}: {details}", flush=True)
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {e}", flush=True)
        return False

def test_coexistence():
    code = """
import onnx
import onnxruntime as ort
import torch

t = torch.tensor([1.0, 2.0, 3.0])
out = t * 2.0
print(f"PyTorch v{torch.__version__} + ONNX v{onnx.__version__} + ORT v{ort.__version__} (Tensor: {out.tolist()})")
"""
    res = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, timeout=15)
    if res.returncode == 0:
        return res.stdout.strip()
    raise RuntimeError(res.stderr.strip()[:200])

def main():
    print("=" * 80)
    print("PYTORCH & ONNX RUNTIME COEXISTENCE VERIFICATION")
    print("=" * 80)
    
    tests = [
        ("Process Coexistence Isolation Check", test_coexistence),
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
