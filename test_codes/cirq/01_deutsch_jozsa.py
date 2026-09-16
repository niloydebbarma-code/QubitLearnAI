"""
Cirq Test Code 01: Deutsch-Jozsa Algorithm (Balanced Oracle)
Executed inside QubitLearn AI Firecracker MicroVM & Linux KVM Sandbox
"""
import cirq

q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit(
    # State preparation: |0> on q0, |1> on q1
    cirq.X(q1),
    cirq.H(q0),
    cirq.H(q1),
    # Balanced Oracle f(x) = x
    cirq.CNOT(q0, q1),
    # Interference
    cirq.H(q0),
    cirq.measure(q0, key='result')
)

result = {
    "framework": "cirq",
    "name": "Deutsch-Jozsa Algorithm",
    "numQubits": 2,
    "oracleType": "balanced",
    "expectedMeasurement": "1", # Guaranteed deterministic outcome '1' for balanced oracle
    "status": "VALID_ALGORITHM"
}
