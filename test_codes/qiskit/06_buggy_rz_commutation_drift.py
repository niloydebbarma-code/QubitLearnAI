"""
Qiskit Test Code 06 [BUGGY CODE / COMPILER BUG]:
Represents Qiskit Compiler Bug #3812 (RZ Target Commutation Phase Drift)
Flawed pass commutes RZ(theta) through the TARGET of a CX gate instead of the CONTROL,
causing a phase error on the entangled target register.
"""
from qiskit import QuantumCircuit
import numpy as np

theta = np.pi / 4

# ORIGINAL CIRCUIT:
qc_original = QuantumCircuit(2)
qc_original.h(0)
qc_original.cx(0, 1)
qc_original.rz(theta, 1)  # RZ on target qubit 1

# FLAGGED COMPILER BUG PASS:
# Optimizer mistakenly moves RZ(theta, 1) to the front of CX(0, 1):
# RZ(theta, 1) * CX(0, 1) != CX(0, 1) * RZ(theta, 1)

result = {
    "framework": "qiskit",
    "name": "Qiskit RZ Target Commutation Drift (Bug #3812)",
    "bugCategory": "INVALID_COMMUTATION_PASS",
    "violation": "RZ commutes only on Control qubit (R11), NOT Target qubit (requires RX on Target, R12).",
    "stateFidelityDrop": 0.2929, # Substantial phase deviation
    "giallarRuleTarget": "R11_RZ_COMMUTE_CONTROL & R12_RX_COMMUTE_TARGET",
    "status": "DETECTED_COMPILER_BUG"
}
