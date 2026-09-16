"""
PennyLane Test Code 01: 2-Qubit Variational Quantum Eigensolver (VQE Ansatz)
Executed inside QubitLearn AI Firecracker MicroVM & Linux KVM Sandbox
"""
import pennylane as qml
import numpy as np

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev)
def vqe_circuit(params):
    # Layer 1: Single-qubit parameterized rotations
    qml.RY(params[0], wires=0)
    qml.RY(params[1], wires=1)
    # Entangler
    qml.CNOT(wires=[0, 1])
    # Layer 2: Final rotation
    qml.RY(params[2], wires=0)
    qml.RY(params[3], wires=1)
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))

# Parameter angles: [0.2, 0.4, 0.6, 0.8]
res_expval = float(vqe_circuit([0.2, 0.4, 0.6, 0.8]))

result = {
    "framework": "pennylane",
    "name": "2-Qubit VQE Hardware-Efficient Ansatz",
    "numQubits": 2,
    "parameterCount": 4,
    "expectationValue": res_expval,
    "status": "VALID_ALGORITHM"
}
