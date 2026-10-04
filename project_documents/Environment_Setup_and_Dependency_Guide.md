# Complete Environment Setup & Dependency Installation Guide
## QubitLearn AI Platform Infrastructure

---

## 1. Quick Start Installation

To install all Python quantum SDKs, scientific packages, Node.js frontend/backend dependencies, Lean 4 toolchains, and verify system integrity, execute the single installer script corresponding to your operating system:

### Linux / macOS / WSL2 / Cloud Compute
```bash
# Clone the repository (if not already local)
cd QubitLearnAI

# Make the setup script executable and run
chmod +x scripts/setup_all_dependencies.sh scripts/setup_lean4_elan_environment.sh
bash scripts/setup_all_dependencies.sh
```

### Windows (PowerShell)
```powershell
Set-Location -Path "D:\Jan 2025\Downloads\QubitLearnAI"
& ".\scripts\setup_all_dependencies.ps1"
```

### Windows (Command Prompt / Double-Click)
```cmd
cd /d "D:\Jan 2025\Downloads\QubitLearnAI"
scripts\setup_all_dependencies.bat
```

---

## 2. Pinned Dependencies Overview

### Python Quantum & Scientific Stack (`requirements.txt`)
| Category | Packages | Version | Description |
| :--- | :--- | :--- | :--- |
| **Quantum SDKs** | `qiskit`, `qiskit-aer` | `2.5.2`, `0.17.2` | IBM Quantum circuit construction and Aer simulation |
| **NISQ Frameworks** | `cirq`, `cirq-core`, `cirq-google` | `1.7.0` | Google Cirq quantum algorithms and gates |
| **Quantum ML** | `pennylane`, `pennylane-lightning`| `0.45.1`, `0.45.0` | Xanadu differentiable quantum gradients & VQE |
| **QEC Engines** | `stim`, `chromobius` | `1.16.0`, `1.1.1` | Stabilizer simulator & color/surface code graph decoders |
| **Graph Theory** | `rustworkx`, `networkx` | `0.18.1`, `3.4.2` | High-performance graph transformations |
| **Scientific Math** | `numpy`, `scipy`, `sympy` | `2.5.3`, `1.18.1`, `1.14.0` | Matrix algebra, sparse Hamiltonians, Lie algebra |
| **Visualization** | `matplotlib`, `rich` | `3.11.2`, `15.0.0` | Circuit diagram rendering and terminal formatting |
| **Deep Learning** | `onnx`, `onnxruntime`, `torch` | `1.23.0`, `1.30.0`, `2.14.0` | 3D space-time syndrome tensor inference |
| **Backend & Cloud** | `fastapi`, `uvicorn`, `flask`, `websockets`, `requests`, `google-auth`, `protobuf` | Latest stable | REST APIs, WebSockets, cloud authentication |

### Node.js Full-Stack Application (`qubitlearn-app/package.json`)
| Category | Packages | Description |
| :--- | :--- | :--- |
| **AI & LLM Services** | `@google/genai` | Google Cloud Vertex AI & Gemini SDK integration |
| **Database & Auth** | `@supabase/supabase-js`, `pg`, `dotenv` | Supabase PostgreSQL client and native driver |
| **Web Server** | `express`, `socket.io`, `socket.io-client` | REST API routing and real-time collaboration |
| **Frontend UI** | `react`, `react-dom`, `katex`, `lucide-react`, `@tailwindcss/vite` | React 18, KaTeX LaTeX math, Lucide icons |
| **Security & Parser**| `dompurify`, `jsonrepair` | XSS sanitization and robust JSON AST repair |
| **Build & Types** | `typescript`, `tsx`, `vite` | TypeScript type-safety and Vite bundling |

---

## 3. Lean 4 Formal Verification Setup (`elan` + `Mathlib4`)

For interactive theorem proving and mathematical autoformalization:
1. **`elan`**: Installs via `https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh`.
2. **`lean-toolchain`**: Pins the exact compiler version (`leanprover/lean4:v4.11.0`).
3. **`Mathlib4`**: Downloaded automatically by `lake init quantum_formal math` with pre-built binary cache (`lake exe cache get`).

---

## 4. System Verification

After running the installer, execute the master verification suite to test all components:
```bash
python test_codes/system_requirements_test.py
```
Expected output: **71/71 checks passed (100.0%)**.
