"""
PennyLane Test Code 02: Quantum Approximate Optimization Algorithm (QAOA Max-Cut)
Executed inside QubitLearn AI Firecracker MicroVM & Linux KVM Sandbox
"""
import pennylane as qml
import numpy as np

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev)
def qaoa_maxcut_layer(gamma, beta):
    # Initial state: |+>|+>
    qml.Hadamard(wires=0)
    qml.Hadamard(wires=1)
    
    # Cost Hamiltonian evolution e^(-i * gamma * Z0 Z1)
    qml.CNOT(wires=[0, 1])
    qml.RZ(2 * gamma, wires=1)
    qml.CNOT(wires=[0, 1])
    
    # Mixer Hamiltonian evolution e^(-i * beta * X)
    qml.RX(2 * beta, wires=0)
    qml.RX(2 * beta, wires=1)
    
    return qml.probs(wires=[0, 1])

# Run with gamma=0.35, beta=0.75
probs = [float(p) for p in qaoa_maxcut_layer(0.35, 0.75)]

result = {
    "framework": "pennylane",
    "name": "QAOA Max-Cut Layer (p=1)",
    "numQubits": 2,
    "probabilities": probs,
    "status": "VALID_ALGORITHM"
}
