#!/usr/bin/env python3
"""
Master Test Orchestrator
Platform Verification

Executes all decoupled, non-synthetic test suites across Python and TypeScript
from a single unified testing directory (tests/):
1. System Requirements & Environment Verification (tests/system_requirements_test.py)
2. MicroVM Snapshot & Memory Isolation (tests/microvm_snapshot_isolation_test.py)
3. IBM Qiskit Circuit Verification (tests/quantum_sdk_qiskit_test.py)
4. Google Cirq Circuit Verification (tests/quantum_sdk_cirq_test.py)
5. Xanadu PennyLane QML Verification (tests/quantum_sdk_pennylane_test.py)
6. Quantum Error Correction with Stim & Chromobius (tests/quantum_error_correction_test.py)
7. Tensor Inference Engine & ONNX Runtime (tests/tensor_inference_engine_test.py)
8. PyTorch & ONNX Process Coexistence (tests/pytorch_onnx_coexistence_test.py)
9. Symbolic Quantum Algebra with SymPy (tests/symbolic_algebra_test.py)
10. Live Vertex AI & Gemini API (tests/cloud_vertex_ai_test.py)
11. Live Supabase PostgreSQL DB (tests/cloud_supabase_db_test.py)
12. Master TypeScript & Full-Stack Suite (tests/run_all_tests.ts)
"""

import sys
import os
import shutil
import subprocess

def run_suite(title, cmd, cwd=None, extra_env=None):
    print("\n" + "=" * 80)
    print(f"RUNNING SUITE: {title}")
    print("=" * 80)
    
    resolved_cmd = list(cmd)
    if resolved_cmd and shutil.which(resolved_cmd[0]):
        resolved_cmd[0] = shutil.which(resolved_cmd[0])
        
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
        
    res = subprocess.run(resolved_cmd, cwd=cwd, env=env, shell=(sys.platform == "win32"))
    return res.returncode == 0

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    tests_dir = os.path.join(root_dir, "tests")
    app_dir = os.path.join(root_dir, "qubitlearn-app")
    node_path = os.path.join(app_dir, "node_modules")

    suites = [
        ("1. System Requirements & Host Environment",
         [sys.executable, os.path.join(tests_dir, "system_requirements_test.py")],
         root_dir, {}),
        ("2. MicroVM Snapshot & Memory Ceiling Isolation",
         [sys.executable, os.path.join(tests_dir, "microvm_snapshot_isolation_test.py")],
         root_dir, {}),
        ("3. IBM Qiskit Circuit Verification",
         [sys.executable, os.path.join(tests_dir, "quantum_sdk_qiskit_test.py")],
         root_dir, {}),
        ("4. Google Cirq Circuit Verification",
         [sys.executable, os.path.join(tests_dir, "quantum_sdk_cirq_test.py")],
         root_dir, {}),
        ("5. Xanadu PennyLane QML Verification",
         [sys.executable, os.path.join(tests_dir, "quantum_sdk_pennylane_test.py")],
         root_dir, {}),
        ("6. Quantum Error Correction (Stim & Chromobius)",
         [sys.executable, os.path.join(tests_dir, "quantum_error_correction_test.py")],
         root_dir, {}),
        ("7. Tensor Inference Engine (ONNX Runtime)",
         [sys.executable, os.path.join(tests_dir, "tensor_inference_engine_test.py")],
         root_dir, {}),
        ("8. PyTorch & ONNX Process Coexistence",
         [sys.executable, os.path.join(tests_dir, "pytorch_onnx_coexistence_test.py")],
         root_dir, {}),
        ("9. Symbolic Quantum Algebra (SymPy)",
         [sys.executable, os.path.join(tests_dir, "symbolic_algebra_test.py")],
         root_dir, {}),
        ("10. Google Cloud Vertex AI & Gemini Interface",
         [sys.executable, os.path.join(tests_dir, "cloud_vertex_ai_test.py")],
         root_dir, {}),
        ("11. Supabase Cloud PostgreSQL Interface",
         [sys.executable, os.path.join(tests_dir, "cloud_supabase_db_test.py")],
         root_dir, {}),
        ("12. Master TypeScript & Full-Stack Verification",
         ["npx.cmd" if sys.platform == "win32" else "npx", "tsx", "tests/run_all_tests.ts"],
         app_dir, {"NODE_PATH": node_path}),
    ]

    passed_suites = 0
    for title, cmd, cwd, env_extra in suites:
        if run_suite(title, cmd, cwd, env_extra):
            passed_suites += 1

    print("\n" + "=" * 80)
    print(f"MASTER VERIFICATION RUN COMPLETE: {passed_suites}/{len(suites)} test suites passed.")
    print("=" * 80)
    sys.exit(0 if passed_suites == len(suites) else 1)

if __name__ == "__main__":
    main()
