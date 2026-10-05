# Lean 4, Elan, and Mathlib4 Setup & Verification Guide
## QubitLearn AI — Formal Quantum Verification Infrastructure

---

## 1. Architectural Distinction: `elan` vs. `Mathlib4`

A common source of confusion in formal verification is the relationship between `elan` and `Mathlib4`. They serve entirely complementary, non-overlapping functions:

```
+---------------------------------------------------------------------------------+
|                                      elan                                       |
|  • What it is: The Lean Toolchain Version Manager (analogous to rustup or nvm)  |
|  • Function : Reads `lean-toolchain` and fetches the exact Lean 4 binary        |
|  • Purpose  : Prevents compiler version drift and language syntax breaking      |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                      lake                                       |
|  • What it is: The Lean 4 Build System & Package Manager (analogous to Cargo)   |
|  • Function : Compiles projects, resolves dependencies, and manages oleans      |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                    Mathlib4                                     |
|  • What it is: The Formal Mathematics Library for Lean 4                        |
|  • Function : Provides complex numbers, Hilbert spaces, unitary matrices, and   |
|               linear algebra needed for quantum circuit invariants              |
+---------------------------------------------------------------------------------+
```

### Why You Must Have `elan`
Lean 4 is under active development. A theorem or proof generated for Lean `v4.11.0` may not compile under `v4.13.0` due to tactic syntax evolutions. `elan` ensures that any workstation, CI/CD pipeline, or isolated microVM automatically pulls and uses the exact compiler version specified in the project's `lean-toolchain` file.

### Why You Still Need `Mathlib4`
The base Lean 4 language provides basic types (naturals, strings, arrays) and type theory primitives. It has no native concept of complex numbers $\mathbb{C}$, inner product spaces $\langle \phi | \psi \rangle$, or unitary matrix transformations $U^\dagger U = I$. `Mathlib4` supplies the formal mathematical foundation required to state and prove quantum mechanics theorems.

---

## 2. How to Test Lean 4 Code and Proofs

Testing in Lean 4 combines compile-time evaluation commands with formal proof type-checking:

### A. Interactive Commands & Unit Testing
| Command | Usage | Failure Behavior |
| :--- | :--- | :--- |
| **`#eval <expr>`** | Evaluates a function or matrix expression at compile time. | Throws runtime exception if function is non-computable. |
| **`#guard <prop>`** | Asserts that a boolean proposition evaluates to `true`. | Fails compilation if the condition is `false`. |
| **`#guard_msgs`** | Asserts that a code block produces a specific compiler diagnostic or error message. | Fails compilation if output does not match target text. |

### B. Mathematical Proof Verification
In theorem proving, **compilation is the test**:
1. Run `lake build` from your project directory.
2. If the build completes with exit code `0` and produces zero warnings/errors, the proof is mathematically verified.
3. **Axiom Audit:** To verify that an LLM did not bypass proofs using the `sorry` placeholder or invalid custom axioms, append `#print axioms <theorem_name>`. The output must only list standard trusted axioms (`Classical.choice`, `Quot.sound`, `propext`).

---

## 3. Repository Organization & File Architecture

To maintain clarity across local development, continuous integration, and production cloud microVM containers, project files are organized as follows:

```
QubitLearnAI/
├── scripts/                                # Global Host & Environment Setup
│   ├── setup_lean4_elan_environment.sh    # Installs elan, Lean 4 & Mathlib4 on Linux/WSL2
│   └── setup_lean4_elan_environment.ps1   # Installs elan & Lean 4 on Windows host
│
├── test_codes/                             # Standalone Multi-SDK & System Test Harness
│   ├── system_requirements_test.py        # System hardware, toolchain & package verification
│   ├── system_requirements_tests.py       # Alias entrypoint
│   └── run_all_benchmarks.ts              # Adversarial and multi-SDK benchmark runner
│
├── qubitlearn-app/                         # Web Application & Full-Stack Platform
│   ├── package.json                        # Node.js dependencies and script entries
│   ├── server.ts                           # Express REST API & WebSocket server
│   ├── scripts/                            # Runtime VM & Container Orchestration
│   │   ├── configure_runtime.ts            # Interactive host diagnostics CLI
│   │   └── install_firecracker.sh          # Firecracker microVM installer
│   ├── src/                                # Application Source Code
│   │   ├── quantum/                        # Quantum simulation & verification kernels
│   │   │   ├── lean4Autoformalizer.ts      # Lean 4 AST & theorem generation
│   │   │   ├── giallarEquivalenceKernel.ts # Giallar 20-rule equivalence engine
│   │   │   └── isingQecDecoder.ts          # NVIDIA Ising 3D CNN QEC pre-decoder
│   │   └── components/                     # React UI components
│   └── tests/                              # Application-Level Test Suites
│       ├── test_quantum_engine.ts          # Browser quantum statevector simulator tests
│       ├── test_ising_qec.ts               # Ising QEC decoding unit tests
│       ├── test_collaboration_websockets.ts# Real-time WebSocket room tests
│       └── benchmark_4_column_ablation.ts  # 4-tier trust ablation verification
│
└── backup/                                 # Preserved Research Documents & Backups
    ├── project_documents/                  # Comprehensive research papers & architecture specs
    └── presentation/                       # Presentation assets & vector slides
```

---

## 4. Automated Setup Scripts

### Linux / WSL2 / Cloud Container (`qubitlearn-app/scripts/setup_lean4_elan_environment.sh`)
```bash
#!/usr/bin/env bash
set -e

echo "=== Installing elan (Lean Toolchain Manager) ==="
curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh -s -- -y

export PATH="${HOME}/.elan/bin:${PATH}"

echo "=== Verifying elan and Lean 4 Installation ==="
elan --version
lean --version
lake --version

echo "=== Initializing Quantum Formalization Workspace ==="
mkdir -p qubitlearn-app/formal_engine && cd qubitlearn-app/formal_engine
echo "leanprover/lean4:v4.11.0" > lean-toolchain

if [ ! -f "lakefile.toml" ] && [ ! -f "lakefile.lean" ]; then
    lake init quantum_formal math
fi

echo "=== Fetching Mathlib4 Cache ==="
lake exe cache get || true

echo "=== Building Quantum Formal Verification Kernel ==="
lake build

echo "=== Lean 4 & Mathlib4 Setup Completed Successfully ==="
```
