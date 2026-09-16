"""
Cirq Test Code 03 [BUGGY CODE / COMPILER BUG]:
Represents Cirq Target Basis Synthesis Bug (Missing Hadamard Conjugation on CZ)
Flawed decomposition attempts to synthesize CNOT(c, t) via CZ(c, t) but fails to conjugate target with Hadamards.
"""
import cirq

q0, q1 = cirq.LineQubit.range(2)

# INTENDED OPERATION: CNOT(q0, q1)
# TRUE SYNTHESIS: H(q1) -> CZ(q0, q1) -> H(q1) (Giallar Rule R15_H_CZ_H_TO_CX)

# BUGGY COMPILER SYNTHESIS PASS:
# Omitted target Hadamards: Circuit produces CZ(q0, q1) instead of CNOT(q0, q1)
circuit_buggy = cirq.Circuit(
    cirq.H(q0),
    cirq.CZ(q0, q1) # Missing H(q1) before and after!
)

result = {
    "framework": "cirq",
    "name": "Cirq Missing Hadamard CZ Conjugation Bug",
    "bugCategory": "BASIS_SYNTHESIS_ERROR",
    "violation": "CZ(c, t) without target Hadamards produces phase-flip instead of bit-flip.",
    "fidelityDrop": 0.50,
    "giallarRuleTarget": "R15_H_CZ_H_TO_CX",
    "status": "DETECTED_COMPILER_BUG"
}
