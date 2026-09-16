# How Giallar Formal Verification Extends to Every Quantum SDK

**Academic Foundation**: *Tao et al., "Giallar: Push-Button Verification for the Qiskit Quantum Compiler", ACM SIGPLAN PLDI 2022 (arXiv:2205.00661)*.

---

## ❓ The Core Problem & Question

The original 2022 Giallar paper was written specifically for **IBM Qiskit's compiler** (`DAGCircuit` in Qiskit Terra). 

*How can QubitLearn AI apply Giallar's formal verification and 20 Coq/Z3 rewrite rules across **all quantum SDKs (Google Cirq, Xanadu PennyLane, Amazon Braket, Microsoft Q#, QuTiP)**?*

---

## 💡 The Deep Mathematical Answer: Group Theory Transcends Python Syntax

### 1. Quantum Gates Are Unitaries in Hilbert Space $\mathcal{H}$, Not Python Objects
In quantum computing, an SDK is merely a syntax wrapper for constructing operators in the **Special Unitary Lie Group $SU(2^n)$**:

| Operation | IBM Qiskit Syntax | Google Cirq Syntax | Xanadu PennyLane Syntax | Mathematical Matrix Operator |
| :--- | :--- | :--- | :--- | :--- |
| **Hadamard** | `qc.h(0)` | `cirq.H(q0)` | `qml.Hadamard(wires=0)` | $\frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}$ |
| **Controlled-NOT** | `qc.cx(0, 1)` | `cirq.CNOT(q0, q1)` | `qml.CNOT(wires=[0,1])` | $\begin{bmatrix} 1&0&0&0\\0&1&0&0\\0&0&0&1\\0&0&1&0 \end{bmatrix}$ |
| **Z-Rotation** | `qc.rz(θ, 0)` | `cirq.rz(θ)(q0)` | `qml.RZ(θ, wires=0)` | $\begin{bmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{bmatrix}$ |

Because quantum gates represent identical linear transformations regardless of the Python class library, **the mathematical soundness of the 20 Giallar rewrite rules holds universally across all quantum frameworks**.

---

## 🏛️ The 3-Stage Universal Intermediate Representation (U-QAST) Pipeline

QubitLearn AI decouples SDK-specific syntax from formal logic verification through a 3-stage compiler bridge:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       UNIVERSAL QUANTUM AST (U-QAST) VERIFICATION PIPELINE                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

  [ IBM Qiskit ]       [ Google Cirq ]       [ Xanadu PennyLane ]     [ AWS Braket / Q# ]
   (Python AST)          (Python AST)            (Tape/QNode)             (AST / OpenQASM)
        │                     │                       │                         │
        └─────────────────────┼───────────────────────┼─────────────────────────┘
                              │
                              ▼  [ Stage 1: Ingestion & Canonical Lifting ]
                 ┌───────────────────────────────────────────────┐
                 │     Universal Canonical Quantum AST (U-QAST)  │
                 │   • Standardized Tuples: Gate(Type, c, t, θ)  │
                 │   • OpenQASM 3.0 Intermediate Representation  │
                 │   • Directed Acyclic Circuit Dependency Graph │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼  [ Stage 2: Giallar Formal Proof Kernel ]
                 ┌───────────────────────────────────────────────┐
                 │    20 Sound Coq/Z3 Invariant Rewrite Rules    │
                 │   • Cancellation Invariants (R1–R6)           │
                 │   • Commutation Relations (R11–R13, R18–R20)  │
                 │   • Basis Synthesis & Merging (R7–R10, R14–17)│
                 │   • Exact Statevector Trace Distance Metric   │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼  [ Stage 3: Verified Lowering & Code Generation ]
                 ┌───────────────────────────────────────────────┐
                 │    Universal Transpiler (transpiler.ts)       │
                 │   • Lowers verified AST into 10 target SDKs   │
                 │   • 100% Mathematically Verified Code Output  │
                 └────────────┬──────────────┬─────────────┬─────┘
                              │              │             │
                              ▼              ▼             ▼
                        [ Verified ]   [ Verified ]   [ Verified ]
                           Qiskit          Cirq        PennyLane
```

---

## 🔍 Concrete Case Studies: Cross-SDK Bug Prevention

### Case 1: Google Cirq Basis Synthesis Bug → Giallar Rule $R_{15}$
* **Problem in Cirq**: When compiling to Google Sycamore native hardware (which uses $CZ$), a flawed pass synthesized CNOT by emitting $CZ(q_0, q_1)$ without target Hadamards.
* **Why Giallar Catches It**:
  1. Cirq's circuit is lifted into U-QAST: `[H(0), CZ(0, 1)]`.
  2. Giallar's Rule **$R_{15}$ (`H_CZ_H_TO_CX`)** specifies:
     $$(I \otimes H) \cdot CZ(c, t) \cdot (I \otimes H) \equiv CX(c, t)$$
  3. The formal prover detects that without the sandwich $H(t)$, the unitary distance is $\delta = \sqrt{2} \ne 0$.
  4. The compiler pass is rejected, and the valid Hadamard sandwich is automatically inserted.

### Case 2: Xanadu PennyLane Continuous Angle Fusion Bug → Giallar Rule $R_{16}$
* **Problem in PennyLane**: In a variational gradient pass (VQE/QAOA), consecutive rotations $R_z(\theta_1)$ and $R_z(\theta_2)$ were merged with a sign error as $R_z(\theta_1 - \theta_2)$.
* **Why Giallar Catches It**:
  1. PennyLane's tape is lifted into U-QAST: `[RZ(θ1, 0), RZ(θ2, 0)]`.
  2. Giallar's Rule **$R_{16}$ (`1Q_ROTATION_MERGE`)** specifies:
     $$R_z(\theta_1) \cdot R_z(\theta_2) \equiv R_z(\theta_1 + \theta_2)$$
  3. The dependent-type prover computes the Lie group generator $e^{-i(\theta_1+\theta_2)Z/2} \ne e^{-i(\theta_1-\theta_2)Z/2}$.
  4. The subtraction glitch is blocked and corrected to addition $(\theta_1 + \theta_2)$.

---

## 📈 Summary of Cross-SDK Benefits

| Capability | Single-SDK Qiskit Giallar (2022) | QubitLearn AI Multi-SDK U-QAST Giallar (2026) |
| :--- | :---: | :---: |
| **Qiskit 1.x Verification** | ✅ Yes | ✅ Yes |
| **Google Cirq Verification** | ❌ No | ✅ Yes (via U-QAST) |
| **Xanadu PennyLane Verification** | ❌ No | ✅ Yes (via U-QAST) |
| **Amazon Braket & Q# Verification** | ❌ No | ✅ Yes (via U-QAST) |
| **Cross-SDK Transpilation Proof** | ❌ No | ✅ Yes (Proves $U_{\text{Qiskit}} \equiv U_{\text{Cirq}}$) |
| **Hardware MicroVM Air-Gapping** | ❌ No | ✅ Yes (Firecracker v1.7.0 + Linux KVM) |
