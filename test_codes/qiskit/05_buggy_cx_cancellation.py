"""
Qiskit Test Code 05 [BUGGY CODE / COMPILER BUG]:
Represents Qiskit Compiler Bug #4465 (Invalid Commutation / Reverse CX Cancellation)
A flawed optimization pass mistakenly cancels CX(0, 1) and CX(1, 0) as if they were identical.
"""
from qiskit import QuantumCircuit

# ORIGINAL INTENDED CIRCUIT:
qc_original = QuantumCircuit(2)
qc_original.h(0)
qc_original.cx(0, 1)
qc_original.cx(1, 0)  # Reversed direction (Non-commuting!)

# FLAGGED COMPILER BUG PASS:
# Flawed compiler optimization pass incorrectly assumes CX(0,1) * CX(1,0) = I and drops both gates!
# Resulting in state |+>|0> instead of the true entangling swap transformation.

result = {
    "framework": "qiskit",
    "name": "Qiskit Flawed CX Commutation Pass (Bug #4465)",
    "bugCategory": "INVALID_INVOLUTIVE_CANCELLATION",
    "violation": "CX(0,1) and CX(1,0) do not commute and do not cancel to Identity.",
    "idealFidelity": 0.50, # 50% fidelity collapse if buggy pass is applied
    "giallarRuleTarget": "R1_CX_CANCEL & R7_SWAP_DECOMPOSITION",
    "status": "DETECTED_COMPILER_BUG"
}
