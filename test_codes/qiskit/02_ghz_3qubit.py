"""
Qiskit Test Code 02: 3-Qubit GHZ Entangled State (|GHZ>)
Executed inside QubitLearn AI Firecracker MicroVM & Linux KVM Sandbox
"""
from qiskit import QuantumCircuit

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

# Expected state: (|000> + |111>) / sqrt(2)
result = {
    "framework": "qiskit",
    "name": "3-Qubit GHZ State",
    "numQubits": 3,
    "gates": 3,
    "expected_state": "0.7071|000> + 0.7071|111>",
    "status": "VALID_ALGORITHM"
}
