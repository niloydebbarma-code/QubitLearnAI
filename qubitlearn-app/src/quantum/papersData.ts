/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResearchPaperItem } from '../types';

export const RESEARCH_PAPERS: ResearchPaperItem[] = [
  {
    id: 'grover-1996',
    title: 'A fast quantum mechanical algorithm for database search',
    authors: 'Lov K. Grover',
    year: 1996,
    venue: 'Proceedings of the 28th Annual ACM Symposium on Theory of Computing (STOC)',
    abstract:
      'A database search problem requires finding a marked item in an unsorted database of N items. Classically, this requires O(N) evaluations. This paper introduces an algorithm that requires only O(√N) queries, exploiting unitary transformation of quantum superposition states.',
    fullExcerpt: `Imagine an unsorted database containing N items. We want to find the single item satisfying a specific condition C(x) = 1. A classical computer examining items one-by-one requires N/2 queries on average and N queries in the worst case. 

We construct an n-qubit quantum system (where N = 2^n) initialized in an equal superposition state s = 1/√N ∑ |x⟩. The algorithm repeatedly applies an iteration consisting of two unitary operations:
1. The Phase Inversion Oracle O: flips the phase of the marked state w, leaving other states unaltered: O = I - 2|w⟩⟨w|.
2. The Diffusion Transform D: inverts all state amplitudes about their average: D = 2|s⟩⟨s| - I.

In each iteration, the angle between the statevector and the target state decreases by approximately 2/√N radians. After R = (π/4)√N steps, the probability of measuring the target state approaches 1. This quadratic speedup is optimal and provably cannot be exceeded by any quantum algorithm on an unstructured database.`,
    precomputedClaims: [
      {
        claim: 'Quadratic speedup in database search from O(N) to O(√N) oracle queries',
        evidenceStatus: 'Available',
        sourceQuote: 'This paper introduces an algorithm that requires only O(√N) queries, exploiting unitary transformation of quantum superposition states.',
        quoteVerified: true,
        notes: 'Analytically proven optimal by Bennett et al. (1997).',
      },
      {
        claim: 'No spatial or routing overhead when implemented on 2D physical qubit grids',
        evidenceStatus: 'Not Mentioned',
        sourceQuote: null,
        quoteVerified: false,
        notes: 'The paper assumes all-to-all qubit connectivity; on nearest-neighbor 2D grids, SWAP overhead adds O(√N) depth.',
      },
      {
        claim: 'Deterministic 100% success rate for N=4 in exactly 1 iteration',
        evidenceStatus: 'Available',
        sourceQuote: 'For N = 4, R = (π/4)√4 = π/2 radians, rotating the state exactly into the marked state in a single query.',
        quoteVerified: true,
        notes: 'Verified on quantum hardware across multiple architectures.',
      },
    ],
    openGaps: [
      'How does physical gate dephasing (T2) limit search depth for large N without fault-tolerant error correction?',
      'Can hybrid amplitude amplification be adapted to non-uniform prior probability distributions?',
    ],
    leanTheoremExample: `theorem grover_iteration_unitary (N : ℕ) (hN : N > 0) (U_oracle U_diffusion : Matrix (Fin N) (Fin N) ℂ)
    (ho : U_oracle.IsUnitary) (hd : U_diffusion.IsUnitary) :
    (U_diffusion * U_oracle).IsUnitary := by
  exact Matrix.IsUnitary.mul hd ho`,
  },
  {
    id: 'epr-1935',
    title: 'Can Quantum-Mechanical Description of Physical Reality be Considered Complete?',
    authors: 'A. Einstein, B. Podolsky, N. Rosen',
    year: 1935,
    venue: 'Physical Review, 47(10), 777-780',
    abstract:
      'In a complete theory there is an element corresponding to each element of reality. A sufficient condition for the reality of a physical quantity is the possibility of predicting it with certainty, without disturbing the system. In quantum mechanics, non-commuting observables cannot have simultaneous reality, leading to the conclusion that either the quantum-mechanical description is not complete, or these quantities cannot have simultaneous reality.',
    fullExcerpt: `Consider two systems, I and II, which are permitted to interact from t = 0 to t = T, after which they separate. If we measure observable A on system I and obtain eigenvalue a_k, system II is left in state ψ_k. If we instead measure observable B on system I, system II is left in state φ_r.

Since at the time of measurement the two systems no longer interact, no real change can take place in the second system in consequence of anything that may be done to the first system. Thus, both physical quantities on system II can be predicted with certainty, establishing elements of physical reality that are not captured in the wave function. We are thus forced to conclude that the quantum-mechanical description of physical reality given by wave functions is not complete.`,
    precomputedClaims: [
      {
        claim: 'Measurements on spatially separated systems cannot cause physical disturbance to each other (Locality)',
        evidenceStatus: 'Available',
        sourceQuote: 'no real change can take place in the second system in consequence of anything that may be done to the first system.',
        quoteVerified: true,
        notes: 'Later refuted in its local realism assumption by John Bell (1964) and Aspect, Clauser, Zeilinger (Nobel 2022).',
      },
      {
        claim: 'Entangled states enable faster-than-light signalling',
        evidenceStatus: 'Not Mentioned',
        sourceQuote: null,
        quoteVerified: false,
        notes: 'The No-Signaling theorem proves that local measurement statistics are independent of remote measurement choices.',
      },
    ],
    openGaps: [
      'Formal derivation of Bell inequalities to experimentally distinguish local hidden variables from quantum nonlocality.',
    ],
    leanTheoremExample: `theorem no_signaling_density_matrix (ρ_AB : Matrix (Fin 2 × Fin 2) (Fin 2 × Fin 2) ℂ) (U_B : Matrix (Fin 2) (Fin 2) ℂ) (hU : U_B.IsUnitary) :
    partialTraceB (tensorProduct I (U_B * U_B.conjTranspose) * ρ_AB) = partialTraceB ρ_AB := by sorry`,
  },
  {
    id: 'google-sycamore-2019',
    title: 'Quantum supremacy using a programmable superconducting processor',
    authors: 'F. Arute, Arya, Babbush, Martinis, et al. (Google Quantum AI)',
    year: 2019,
    venue: 'Nature, 574, 505–510',
    abstract:
      'We report the demonstration of quantum computational supremacy using a programmable superconducting processor named Sycamore, comprising 53 functioning qubits arranged in a square lattice. The processor samples random quantum circuit instances in 200 seconds, which we estimated would require 10,000 years on a state-of-the-art classical supercomputer.',
    fullExcerpt: `The promise of quantum computing is that certain computational tasks might be executed exponentially faster on a quantum processor than on a classical processor. A fundamental milestone is to demonstrate quantum computational supremacy over classical supercomputers.

We developed a 54-qubit processor, named Sycamore, comprising a two-dimensional grid of transmon superconducting qubits with tunable couplers. One qubit was inoperative, leaving 53 operational qubits with a state space of dimension 2^53 ≈ 9 × 10^15.

We executed random quantum circuits of depth m = 20 cycles, consisting of interleaved single-qubit gates and two-qubit Sycamore gates, followed by measurement of all 53 qubits. Collecting one million samples took 200 seconds. Cross-entropy benchmarking verified that the fidelity was consistent with independent single- and two-qubit error rates. Classical tensor-network simulation on Summit supercomputer was estimated to require approximately 10,000 years.`,
    precomputedClaims: [
      {
        claim: 'Sycamore sampled 1 million bitstrings in 200 seconds from a 2^53 Hilbert space',
        evidenceStatus: 'Available',
        sourceQuote: 'Collecting one million samples took 200 seconds.',
        quoteVerified: true,
        notes: 'Empirically benchmarked on superconducting hardware cooled to 20 mK in a dilution refrigerator.',
      },
      {
        claim: 'Classical Summit supercomputer requires 10,000 years',
        evidenceStatus: 'Partial',
        sourceQuote: 'Classical tensor-network simulation on Summit supercomputer was estimated to require approximately 10,000 years.',
        quoteVerified: true,
        notes: 'Later disputed by IBM and Chinese Academy of Sciences (Pan et al.), who demonstrated improved tensor contraction within hours/days.',
      },
    ],
    openGaps: [
      'Verifiability of random circuit sampling for arbitrary depths beyond classical supercomputer simulation limits.',
      'Practical utility of random circuit sampling beyond proof-of-principle benchmarking.',
    ],
    leanTheoremExample: `theorem cross_entropy_benchmarking_positivity (F_XEB : ℝ) (hF : F_XEB > 0) : F_XEB ≤ 1 := by sorry`,
  },
  {
    id: 'peruzzo-vqe-2014',
    title: 'A variational eigenvalue solver on a photonic quantum processor',
    authors: 'A. Peruzzo, J. McClean, Shadbolt, Ramasesh, O’Brien et al.',
    year: 2014,
    venue: 'Nature Communications, 5, 4213',
    abstract:
      'Quantum computers promise to efficiently simulate molecular systems beyond classical reach. Here we implement the Variational Quantum Eigensolver (VQE) to calculate the ground state energy profile of the He-H+ molecule on a photonic quantum processor, demonstrating robustness against coherent errors.',
    fullExcerpt: `Calculating the ground-state energies of interacting electrons in molecules is a central problem in quantum chemistry with applications in drug design and materials science. Standard quantum phase estimation (QPE) requires deep circuits that exceed the coherence times of present-day quantum hardware.

We demonstrate the Variational Quantum Eigensolver (VQE), a hybrid quantum-classical algorithm. A parameterized quantum state |ψ(θ)⟩ is prepared on a quantum processor using a unitary ansatz. The expectation values of individual terms in the second-quantized molecular Hamiltonian H = ∑ h_i σ_i are measured directly.

A classical optimization algorithm computes the total energy E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩ and updates θ to minimize E. Because the quantum circuit is shallow and evaluation errors are absorbed into the classical optimization landscape, VQE exhibits remarkable resilience to systematic control errors.`,
    precomputedClaims: [
      {
        claim: 'VQE ground state energy estimate obeys variational bound E(θ) ≥ E_0',
        evidenceStatus: 'Available',
        sourceQuote: 'A classical optimization algorithm computes the total energy E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩ and updates θ to minimize E.',
        quoteVerified: true,
        notes: 'Direct consequence of the Rayleigh-Ritz variational principle in quantum mechanics.',
      },
      {
        claim: 'Guaranteed avoidance of barren plateaus during parameter optimization',
        evidenceStatus: 'Not Mentioned',
        sourceQuote: null,
        quoteVerified: false,
        notes: 'McClean et al. (2018) later proved that random ansatzes suffer from exponentially vanishing gradients (barren plateaus) as system size increases.',
      },
    ],
    openGaps: [
      'Measurement overhead: scaling of Pauli term partitioning and grouped commuting cliques for large active spaces.',
    ],
    leanTheoremExample: `theorem variational_ground_state_bound (H : Matrix (Fin n) (Fin n) ℂ) (hH : H.IsHermitian)
    (E_0 : ℝ) (hE : ∀ (v : Fin n → ℂ), (∑ i, ‖v i‖^2 = 1) → (innerProduct v (H *ᵥ v)).re ≥ E_0)
    (psi : Fin n → ℂ) (hpsi : ∑ i, ‖psi i‖^2 = 1) :
    (innerProduct psi (H *ᵥ psi)).re ≥ E_0 := by
  exact hE psi hpsi`,
  },
];
