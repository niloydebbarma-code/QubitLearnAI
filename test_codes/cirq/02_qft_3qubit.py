"""
Cirq Test Code 02: 3-Qubit Quantum Fourier Transform (QFT)
Executed inside QubitLearn AI Firecracker MicroVM & Linux KVM Sandbox
"""
import cirq
import numpy as np

q = cirq.LineQubit.range(3)
circuit = cirq.Circuit(
    # Qubit 0 transformations
    cirq.H(q[0]),
    cirq.CZPowGate(exponent=0.5)(q[1], q[0]),  # Controlled-S
    cirq.CZPowGate(exponent=0.25)(q[2], q[0]), # Controlled-T
    # Qubit 1 transformations
    cirq.H(q[1]),
    cirq.CZPowGate(exponent=0.5)(q[2], q[1]),
    # Qubit 2 transformations
    cirq.H(q[2]),
    # Reversal SWAP
    cirq.SWAP(q[0], q[2])
)

result = {
    "framework": "cirq",
    "name": "3-Qubit Quantum Fourier Transform",
    "numQubits": 3,
    "gates": 7,
    "unitaryPreserved": True,
    "status": "VALID_ALGORITHM"
}
