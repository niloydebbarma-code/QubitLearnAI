# QubitLearn AI — Cloud Infrastructure, VM Backends & Runtime Architecture

---

## 🏛️ 1. Executive Infrastructure Overview

QubitLearn AI is designed with a modular, cost-efficient cloud topology that decouples frontend presentation and AI reasoning from hardware-isolated quantum simulation and untrusted code execution.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRODUCTION ARCHITECTURE TOPOLOGY                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                 [ Evaluator / Student Browser ]
                                                │
                                                ▼ (HTTPS / WSS)
                 ┌─────────────────────────────────────────────────────────────┐
                 │          Google Cloud Run (qubitlearn-app Container)        │
                 │   • Node.js 20 / Express Gateway + React 18 SPA (Vite)      │
                 │   • Multi-tier Rate Limiter (120 req/min, 15 AI req/10 min) │
                 │   • JSON-Repair AI Response Parser & Sanitizer              │
                 │   • In-Memory Bitmask Statevector Engine (< 2ms simulation) │
                 └──────────────┬──────────────────────────────┬───────────────┘
                                │                              │
                (Google Cloud IAM / ADC)              (Private VPC Subnet)
                                │                              │
                                ▼                              ▼
                 ┌─────────────────────────────┐┌──────────────────────────────┐
                 │   Google Cloud Vertex AI    ││   Compute Engine N2 Host     │
                 │ • Gemini 3.7 Flash Engine   ││ • n2-standard-2 (2 vCPU, 8GB)│
                 │ • 2D Spatial Circuit Vision ││ • Nested KVM (/dev/kvm)      │
                 │ • Socratic Reflexion Loop   ││ • Firecracker MicroVM v1.7.0 │
                 └─────────────────────────────┘│ • Zero Network Air-Gapped VM │
                                                └──────────────────────────────┘
```

---

## ⚙️ 2. Execution Runtime Modes (`.env` Matrix)

The application dynamically selects its execution sandbox backend based on environment configuration without requiring code rebuilds:

| Mode (`QUANTUM_EXECUTION_MODE`) | Target Infrastructure | Nested KVM Required? | Typical Cost | Security Boundary |
| :--- | :--- | :---: | :---: | :--- |
| **`IN_MEMORY_V8`** *(Default)* | Cloud Run / Local Node | **No** | $0.00 (Free Tier) | Fast in-memory V8 sandbox with deterministic bitmask statevector simulator ($<2\text{ ms}$). |
| **`FIRECRACKER_KVM`** | GCP Compute Engine N2 (`n2-standard-2`) or Local WSL2 | **Yes** (`/dev/kvm`) | ~$0.097/hr (~$5–7 for judging) | Hardware-level microVM jail (5ms cold start, zero network access, ephemeral cleanup). |
| **`CLOUD_RUN_SANDBOX`** | Google Cloud Run Container Sandbox | **No** | Pay-per-request / Free Tier | Managed container isolation for executing sandboxed Python code. |
| **`BINARY_RUNTIME`** | GCP Compute Engine E2 (`e2-micro` / `e2-medium`) | **No** | $0 to ~$7/month | Standalone precompiled SDK binary execution on standard VMs. |

---

## 🛠️ 3. Interactive Runtime Configurator CLI

Developers and evaluators can inspect their host capabilities and switch runtime modes interactively using the built-in configurator:

```bash
cd qubitlearn-app
npm run setup:runtime
```

### What the Configurator Scans:
1. **WSL2 / Linux Kernel**: Detects if Windows Subsystem for Linux or native Linux is active.
2. **Hardware KVM (`/dev/kvm`)**: Confirms whether hardware-level nested virtualization is enabled.
3. **Firecracker Binary**: Scans for `firecracker --version` (v1.7.0).
4. **Python & Qiskit**: Checks local Python and quantum libraries.
5. **Interactive Menu**: Prompts you to select `[1]` Cloud Run, `[2]` Remote N2 VM, `[3]` Local WSL2 KVM, or `[4]` Binary Runtime, then automatically configures `.env`.

---

## 💻 4. Local Testing with Hardware KVM & Firecracker in WSL2

You can test real Firecracker microVM execution locally on Windows 11 / WSL2 with **zero cloud compute cost**:

### Prerequisites:
- Windows 11 with WSL2 (WSL version $\ge 2.0$, Kernel $\ge 6.6$).
- Confirm `/dev/kvm` is active:
  ```bash
  wsl.exe -e sh -c "ls -la /dev/kvm"
  # Output: crw-rw---- 1 root kvm 10, 232 /dev/kvm
  ```

### Step-by-Step Setup:
```bash
# 1. Download and install Firecracker v1.7.0 in WSL2
mkdir -p ~/firecracker && cd ~/firecracker
curl -sSL https://github.com/firecracker-microvm/firecracker/releases/download/v1.7.0/firecracker-v1.7.0-x86_64.tgz | tar -xz
cp release-v1.7.0-x86_64/firecracker-v1.7.0-x86_64 ./firecracker
chmod +x ./firecracker

# 2. Verify Firecracker execution
~/firecracker/firecracker --version
# Output: Firecracker v1.7.0

# 3. Configure QubitLearn AI to use Local WSL2 KVM
cd qubitlearn-app
npm run setup:runtime
# Select Option [3] Local WSL2 Linux KVM
```

---

## 💰 5. Google Cloud Cost & Resource Analysis

### A. Main App on Cloud Run (Production Recommended)
- **CPU / RAM**: `--cpu=1`, `--memory=1Gi`, `--concurrency=20`, `--max-instances=3`.
- **Cost**: **$0.00 / month** (within Google Cloud Run Free Tier allowance of 2M requests/month).
- **Vertex AI Gemini 3.7 Flash**: Pay-per-token or Free Tier quota.

### B. Dedicated Compute Engine N2 VM for Firecracker (Optional for Live Demo)
- **Machine Type**: `n2-standard-2` (2 vCPUs, 8 GiB Memory, Nested Virtualization enabled).
- **On-Demand Price**: `$0.097118 / hour`.
- **Judging Period Cost (48–72 Hours)**:
  - 48 Hours: $\$0.097118 \times 48 \approx \$4.66$
  - 72 Hours: $\$0.097118 \times 72 \approx \$6.99$
- **Automatic Fallback**: If the N2 VM is powered down to save costs, the Cloud Run platform automatically falls back to in-memory simulation with zero downtime.

### C. Why Not `e2-micro` for Firecracker?
- Google Cloud does **not** support nested virtualization on the `E2` machine family.
- An `e2-micro` can host standard Python or precompiled binaries, but **cannot** run Firecracker microVMs because `/dev/kvm` is unavailable on E2 hardware.

---

## 🔒 6. Security & Air-Gapping Guarantees

Every sandboxed execution enforces three strict security invariant boundaries:
1. **Network Isolation (`noNetwork: true`)**: Untrusted user code runs in a sandbox with zero external internet connectivity.
2. **Wall-Clock Timeout (`wallClockBounded: true`)**: CPU execution is strictly bounded to `SANDBOX_TIMEOUT_MS` (default: 3000ms).
3. **Ephemeral Cleanup (`ephemeralCleaned: true`)**: Guest microVM instances and execution contexts are discarded after every run, preventing state leakage across user sessions.
