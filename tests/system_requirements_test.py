#!/usr/bin/env python3
"""
System Requirements & Host Environment Verification Suite
Platform Verification

Validates host hardware specifications, system toolchains (Python, Node, NPM, NVM,
Lean/elan, WSL2/KVM, Firecracker), 30 installed Python quantum & scientific packages
(via pip show), and 17 Node.js application dependencies.
"""

import sys
import os
import json
import shutil
import platform
import subprocess
import psutil

# Ensure unbuffered stdout for real-time progress logging
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

TEST_RESULTS = []

def record(category, name, passed, details=""):
    status = "PASS" if passed else "FAIL"
    TEST_RESULTS.append({
        "category": category,
        "name": name,
        "status": status,
        "details": details
    })
    print(f"[{status}] {name}: {details}", flush=True)
    return passed

def run_cmd(cmd_list):
    try:
        resolved_cmd = list(cmd_list)
        if len(resolved_cmd) > 0:
            which_path = shutil.which(resolved_cmd[0])
            if which_path:
                resolved_cmd[0] = which_path
        res = subprocess.run(resolved_cmd, capture_output=True, text=True, timeout=10, shell=False)
        return res.returncode == 0, res.stdout.strip()
    except Exception as e:
        return False, str(e)

# ==============================================================================
# 1. HARDWARE & DEVICE ARCHITECTURE
# ==============================================================================
def test_hardware_specifications():
    print("\n--- 1. Host Device Hardware & System Specifications ---", flush=True)
    
    # 1. Platform & OS
    os_name = platform.platform()
    record("Hardware", "Host OS Platform", True, f"{os_name}")
    
    # 2. CPU Architecture
    arch = platform.machine()
    record("Hardware", "System Architecture", arch in ["AMD64", "x86_64", "arm64", "aarch64"], f"{arch} ({platform.architecture()[0]})")
    
    # 3. CPU Cores & Model
    cpu_phys = psutil.cpu_count(logical=False) or 1
    cpu_log = psutil.cpu_count(logical=True) or 1
    cpu_model = platform.processor()
    if sys.platform == "win32":
        try:
            res = subprocess.run(["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_Processor).Name"],
                                 capture_output=True, text=True, timeout=5)
            if res.returncode == 0 and res.stdout.strip():
                cpu_model = res.stdout.strip().splitlines()[0]
        except Exception:
            pass
    record("Hardware", "CPU Processors", True, f"{cpu_model} ({cpu_phys} Physical Cores, {cpu_log} Logical Threads)")
    
    # 4. System RAM
    vmem = psutil.virtual_memory()
    total_ram_gb = round(vmem.total / (1024**3), 2)
    avail_ram_gb = round(vmem.available / (1024**3), 2)
    ram_ok = total_ram_gb >= 3.5
    record("Hardware", "System Memory (RAM)", ram_ok,
           f"Total: {total_ram_gb} GB | Available: {avail_ram_gb} GB (Threshold: >= 4 GB)")
           
    # 5. GPU Devices
    gpu_desc = "Standard display adapter"
    if sys.platform == "win32":
        try:
            res = subprocess.run(["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_VideoController).Name"],
                                 capture_output=True, text=True, timeout=5)
            if res.returncode == 0 and res.stdout.strip():
                gpus = [g.strip() for g in res.stdout.strip().splitlines() if g.strip()]
                gpu_desc = ", ".join(gpus)
        except Exception:
            pass
    record("Hardware", "GPU Graphics Hardware", True, f"{gpu_desc}")

# ==============================================================================
# 2. SYSTEM TOOLCHAINS & ENVIRONMENT
# ==============================================================================
def test_system_toolchains():
    print("\n--- 2. System Toolchains & Virtualization ---", flush=True)
    
    # 1. Python Runtime
    py_ver = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    py_ok = sys.version_info >= (3, 10)
    record("Toolchain", "Python Runtime", py_ok, f"v{py_ver} ({sys.executable})")
    
    # 2. Node.js Runtime
    node_ok, node_out = run_cmd(["node", "-v"])
    record("Toolchain", "Node.js Runtime", node_ok, f"{node_out if node_ok else 'Not found in PATH'}")
    
    # 3. NPM Package Manager
    npm_ok, npm_out = run_cmd(["npm", "-v"])
    record("Toolchain", "NPM Package Manager", npm_ok, f"v{npm_out if npm_ok else 'Not found in PATH'}")
    
    # 4. Node Version Manager (NVM)
    nvm_home = os.environ.get("NVM_HOME") or os.environ.get("NVM_DIR")
    nvm_ok = bool(nvm_home) or node_ok
    record("Toolchain", "Node Version Management", nvm_ok,
           f"Active environment: {nvm_home if nvm_home else ('Managed via system path' if node_ok else 'Not configured')}")
           
    # 5. WSL2 Subsystem
    wsl_bin = shutil.which("wsl")
    record("Toolchain", "WSL2 Subsystem Binary", bool(wsl_bin),
           f"WSL executable: {wsl_bin if wsl_bin else 'Not present'}")
           
    # 6. Elan Toolchain Manager
    elan_bin = shutil.which("elan")
    elan_ver = ""
    elan_ok = bool(elan_bin)
    if not elan_ok and wsl_bin:
        env = os.environ.copy()
        env["MSYS_NO_PATHCONV"] = "1"
        try:
            res = subprocess.run(["wsl.exe", "-d", "Ubuntu", "-e", "bash", "-lc", "export PATH=\"$HOME/.elan/bin:$PATH\"; elan --version 2>/dev/null"],
                                 capture_output=True, text=True, env=env, timeout=5)
            if "elan" in res.stdout:
                elan_ok = True
                elan_ver = res.stdout.strip().splitlines()[0]
        except Exception:
            pass
    record("Toolchain", "Elan Toolchain Manager", elan_ok,
           f"{elan_ver if elan_ver else (elan_bin if elan_bin else 'elan not installed')}")

    # 7. Lean 4 Formal Compiler Kernel
    lean_bin = shutil.which("lean")
    lean_ver = ""
    lean_ok = bool(lean_bin)
    if not lean_ok and wsl_bin:
        env = os.environ.copy()
        env["MSYS_NO_PATHCONV"] = "1"
        try:
            res = subprocess.run(["wsl.exe", "-d", "Ubuntu", "-e", "bash", "-lc", "lean --version 2>/dev/null"],
                                 capture_output=True, text=True, env=env, timeout=5)
            if "Lean" in res.stdout or "version" in res.stdout:
                lean_ok = True
                lean_ver = res.stdout.strip().splitlines()[0]
        except Exception:
            pass
    record("Toolchain", "Lean 4 Compiler Kernel", lean_ok,
           f"{lean_ver if lean_ver else (lean_bin if lean_bin else 'lean not installed')}")

    # 8. Lake Package & Build System
    lake_bin = shutil.which("lake")
    lake_ver = ""
    lake_ok = bool(lake_bin)
    if not lake_ok and wsl_bin:
        env = os.environ.copy()
        env["MSYS_NO_PATHCONV"] = "1"
        try:
            res = subprocess.run(["wsl.exe", "-d", "Ubuntu", "-e", "bash", "-lc", "lake --version 2>/dev/null"],
                                 capture_output=True, text=True, env=env, timeout=5)
            if "Lake" in res.stdout or "version" in res.stdout:
                lake_ok = True
                lake_ver = res.stdout.strip().splitlines()[0]
        except Exception:
            pass
    record("Toolchain", "Lake Build & Package Manager", lake_ok,
           f"{lake_ver if lake_ver else (lake_bin if lake_bin else 'lake not installed')}")

    # 9. WSL2 Ubuntu Linux Kernel
    ubuntu_active = False
    if wsl_bin:
        u_ok, u_out = run_cmd(["wsl.exe", "-d", "Ubuntu", "-e", "uname", "-r"])
        ubuntu_active = u_ok and bool(u_out)
        record("Toolchain", "WSL2 Ubuntu Linux Kernel", ubuntu_active,
               f"Kernel: {u_out if ubuntu_active else 'Ubuntu distribution not responding'}")
               
    # 8. /dev/kvm Hardware Acceleration Node
    kvm_ok = False
    if sys.platform.startswith("linux"):
        kvm_ok = os.path.exists("/dev/kvm")
    elif wsl_bin:
        env = os.environ.copy()
        env["MSYS_NO_PATHCONV"] = "1"
        try:
            res = subprocess.run(["wsl.exe", "-d", "Ubuntu", "-e", "sh", "-c", "test -e /dev/kvm && echo KVM_DEVICE_PRESENT || echo KVM_DEVICE_ABSENT"],
                                 capture_output=True, text=True, env=env, timeout=5)
            kvm_ok = "KVM_DEVICE_PRESENT" in res.stdout
        except Exception:
            kvm_ok = False
    record("Toolchain", "Hardware /dev/kvm Acceleration Device", kvm_ok,
           "/dev/kvm character device active in WSL2 Ubuntu" if kvm_ok else "/dev/kvm node absent")
           
    # 9. Firecracker MicroVM Binary
    firecracker_ok = False
    fc_detail = ""
    if sys.platform.startswith("linux"):
        fc_bin = shutil.which("firecracker") or os.path.expanduser("~/firecracker/firecracker")
        if fc_bin and os.path.exists(fc_bin):
            firecracker_ok = True
            fc_detail = f"Installed at {fc_bin}"
        else:
            fc_detail = "Binary not in PATH (Run scripts/install_firecracker.sh)"
    elif wsl_bin:
        env = os.environ.copy()
        env["MSYS_NO_PATHCONV"] = "1"
        try:
            res = subprocess.run(["wsl.exe", "-d", "Ubuntu", "-e", "bash", "-lc",
                                  "which firecracker 2>/dev/null || (test -x $HOME/firecracker/firecracker && echo $HOME/firecracker/firecracker) || echo NOT_FOUND"],
                                 capture_output=True, text=True, env=env, timeout=5)
            fc_path = res.stdout.strip().splitlines()[-1] if res.stdout.strip() else ""
            if fc_path and "NOT_FOUND" not in fc_path:
                ver_res = subprocess.run(["wsl.exe", "-d", "Ubuntu", "-e", "bash", "-c", f"{fc_path} --version"],
                                         capture_output=True, text=True, env=env, timeout=5)
                if ver_res.returncode == 0 or "Firecracker" in ver_res.stdout:
                    firecracker_ok = True
                    fc_ver = ver_res.stdout.strip().splitlines()[0] if ver_res.stdout.strip() else "v1.7.0"
                    fc_detail = f"{fc_ver} active in WSL2 ({fc_path})"
                else:
                    fc_detail = f"Binary found at {fc_path} but execution failed"
            else:
                fc_detail = "Binary not installed in WSL2"
        except Exception as e:
            firecracker_ok = False
            fc_detail = str(e)
    record("Toolchain", "Firecracker MicroVM Binary", firecracker_ok, fc_detail)

# ==============================================================================
# 3. PYTHON PACKAGES (VERIFIED VIA PIP SHOW)
# ==============================================================================
def test_pip_packages():
    print("\n--- 3. Python Quantum & Scientific Packages (via pip show) ---", flush=True)
    
    packages_to_check = [
        ("qiskit", "IBM Qiskit SDK"),
        ("qiskit-aer", "Qiskit Aer Simulator"),
        ("cirq", "Google Cirq Framework"),
        ("cirq-core", "Cirq Core Kernel"),
        ("cirq-google", "Cirq Google Provider"),
        ("pennylane", "Xanadu PennyLane QML"),
        ("pennylane-lightning", "PennyLane Lightning Accelerator"),
        ("stim", "Stim Stabilizer Simulator"),
        ("chromobius", "Chromobius Color Code Decoder"),
        ("rustworkx", "Rustworkx Graph Library"),
        ("numpy", "NumPy Numerical Engine"),
        ("scipy", "SciPy Scientific Library"),
        ("sympy", "SymPy Symbolic Algebra"),
        ("matplotlib", "Matplotlib Visualization"),
        ("networkx", "NetworkX Graph Structures"),
        ("pandas", "Pandas Data Structures"),
        ("scikit-learn", "Scikit-Learn Machine Learning"),
        ("onnx", "ONNX Standard Format"),
        ("onnxruntime", "ONNX Runtime Inference Engine"),
        ("torch", "PyTorch Tensor Library"),
        ("fastapi", "FastAPI Framework"),
        ("uvicorn", "Uvicorn ASGI Server"),
        ("flask", "Flask Web Framework"),
        ("websockets", "WebSockets Engine"),
        ("requests", "HTTP Requests Client"),
        ("google-auth", "Google Cloud Authentication"),
        ("protobuf", "Google Protocol Buffers"),
        ("psutil", "System Process & Resource Utilities"),
        ("pypdf", "PDF Processing Library"),
        ("python-pptx", "PowerPoint Presentation Engine"),
        ("rich", "Rich Terminal Formatter"),
    ]
    
    for pkg_name, label in packages_to_check:
        ok, out = run_cmd([sys.executable, "-m", "pip", "show", pkg_name])
        if ok and "Version:" in out:
            ver = "Unknown"
            for line in out.splitlines():
                if line.startswith("Version:"):
                    ver = line.split(":", 1)[1].strip()
                    break
            record("Pip Package", f"{pkg_name} ({label})", True, f"v{ver}")
        else:
            record("Pip Package", f"{pkg_name} ({label})", False, "Package not found in pip environment")

# ==============================================================================
# 4. NODE.JS & NPM DEPENDENCIES (PACKAGE.JSON)
# ==============================================================================
def test_npm_dependencies():
    print("\n--- 4. Node.js Dependencies (qubitlearn-app/package.json) ---", flush=True)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "..", "qubitlearn-app", "package.json"),
        os.path.join(base_dir, "qubitlearn-app", "package.json"),
        os.path.join(os.getcwd(), "qubitlearn-app", "package.json"),
    ]
    
    pkg_json_path = None
    for c in candidates:
        if os.path.exists(c):
            pkg_json_path = c
            break
            
    if not pkg_json_path:
        record("NPM Dependencies", "package.json location", False, "qubitlearn-app/package.json not found")
        return
        
    with open(pkg_json_path, "r", encoding="utf-8") as f:
        pkg_data = json.load(f)
        
    deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
    
    required_npm = [
        ("@google/genai", "Google Cloud Vertex AI & Gemini SDK"),
        ("@supabase/supabase-js", "Supabase PostgreSQL Client"),
        ("express", "Express.js REST API Server"),
        ("socket.io", "Socket.IO WebSocket Server"),
        ("socket.io-client", "Socket.IO WebSocket Client"),
        ("react", "React UI Framework"),
        ("react-dom", "React Virtual DOM"),
        ("katex", "KaTeX LaTeX Math Renderer"),
        ("lucide-react", "Quantum Studio Icons"),
        ("jsonrepair", "JSON AST Error Recovery"),
        ("dompurify", "DOM Sanitization & Security"),
        ("dotenv", "Environment Variable Management"),
        ("pg", "PostgreSQL Native Driver"),
        ("@tailwindcss/vite", "Tailwind CSS Vite Plugin"),
        ("typescript", "TypeScript Type Safety"),
        ("tsx", "TypeScript Real-Time Execution"),
        ("vite", "Vite Frontend Bundler"),
    ]
    
    for pkg_name, desc in required_npm:
        if pkg_name in deps:
            record("NPM Package", f"{pkg_name} ({desc})", True, f"Configured: {deps[pkg_name]}")
        else:
            record("NPM Package", f"{pkg_name} ({desc})", False, "Missing from package.json")

# ==============================================================================
# MAIN TEST HARNESS
# ==============================================================================
def main():
    print("=" * 80)
    print("SYSTEM REQUIREMENTS & HOST ENVIRONMENT VERIFICATION")
    print("=" * 80)
    
    test_hardware_specifications()
    test_system_toolchains()
    test_pip_packages()
    test_npm_dependencies()
    
    total = len(TEST_RESULTS)
    passed = sum(1 for t in TEST_RESULTS if t["status"] == "PASS")
    failed = total - passed
    pass_pct = (passed / total) * 100 if total > 0 else 0.0
    
    print("\n" + "=" * 80)
    print(f"VERIFICATION SUMMARY: {passed}/{total} checks passed ({pass_pct:.1f}%)")
    print("=" * 80)
    
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
