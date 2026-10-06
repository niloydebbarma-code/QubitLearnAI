# QubitLearn AI test specification

**Status:** acceptance plan, not a fabricated pass report  
**Owner:** QubitLearn AI maintainers  
**Last reviewed:** 2026-10-06  

## 1. Why this file exists

The old verification report describes 101 domain tests and 64 toolchain checks, but the
repository's runnable TypeScript harness currently reports 82 checks. A package/build
check, an environment check, a source-string check, and a metadata check are not a
substitute for an assertion about user-visible behavior.

This file is the source of truth for the product test backlog. It contains **100
behavioral tests** (75+ required) with stable IDs, exact implementation targets, and
observable assertions. Tests are counted only when they execute the target code and
assert a result, error, side effect, or protocol message. Hardware, package,
credential, build, and dependency checks are release gates, but are **not** counted
as product tests.

The current baseline is:

| Check | Command | Observed result |
|---|---|---|
| TypeScript harness | `cd qubitlearn-app && npm test` | Runner includes the five-user WebSocket and AI-output boundary suites; record the exact result from each run |
| Production bundle | `cd qubitlearn-app && npm run build` | Passes; Vite emits a chunk-size warning |
| Python suites named by the old report | `qubitlearn-app/tests/*.py` | Must be verified against files that exist before being reported |

The previous 82-test result is not a release approval. The harness previously did not set a
non-zero exit code when a suite failed; this is fixed in
[`run_all_tests.ts`](D:/Jan%202025/Downloads/QubitLearnAI/qubitlearn-app/tests/run_all_tests.ts).

> **Important: hallucination reduction is not proven.** None of the current
> 82/84 TypeScript checks, including the five-user WebSocket checks, measures or
> demonstrates a reduction in AI hallucinations. They test transport, formatting,
> selected computations, and application behavior. They must not be summarized as
> “AI hallucinations reduced” until the evaluation below is implemented and passes.

The WebSocket suite is now a real five-user scenario in
[`websocket_synchronization_test.ts`](D:/Jan%202025/Downloads/QubitLearnAI/qubitlearn-app/tests/websocket_synchronization_test.ts):
five independent clients connect, join one room, one user broadcasts to four peers,
a second room is checked for leakage, and ordered mutations are checked. A two-user
handshake alone is not sufficient evidence for collaboration.

## 2. Scope mapped to the technical approach

The matrix maps the technical approach described by the architecture material and
the Slide 3/4 implementation comments in the application:

* **Slide 3 / interactive technical pipeline:** circuit editing, deterministic
  state simulation, Giallar optimization, bidirectional SDK transpilation, diagram
  generation, AI verification, and isolated execution.
* **Slide 4 / product and verification surfaces:** authentication, API contracts,
  course/challenge progress, assessment, document/video analysis, collaboration,
  resilience, security, and instructor telemetry.

The mapping is deliberately implementation-based. If the presentation uses a
different slide numbering, update only this mapping; do not weaken the assertions.

## 2.1 What the current code can and cannot prove

The following distinctions are mandatory in reports:

| Area | Current executable evidence | What it does **not** prove yet |
|---|---|---|
| WebSockets | Five local Socket.IO clients, room fan-out, cross-room isolation, and ordered delivery | Authentication/authorization, reconnect conflict resolution, persistence, packet loss, or five users across separate machines |
| Giallar | Rule metadata and selected optimizer transformations execute in TypeScript | Coq/Z3 formal soundness, all 20 semantic equivalences, or randomized differential equivalence for every rule |
| Lean 4 | The project can invoke the compiler when installed; some catalog entries are source metadata | A theorem is not proven merely because it has `typeCheckStatus: PROVEN`; code containing `sorry` or a trivial `True` theorem is not acceptable evidence |
| Ising decoder | Syndrome dimensions, pre-decoder execution, and a stochastic benchmark function run | The current implementation is not evidence of an NVIDIA-trained 17-layer model or an independently reproduced published result; it uses `Math.random()` and heuristic logic |
| Research papers | Catalog and stored quote flags can be inspected | Empirical reproduction, source authenticity, citation correctness, or independent scientific validation |
| AI generation | Prompt/response plumbing can be tested with controlled failures | Hallucination elimination; generated code must still pass SDK execution, state simulation, optimizer equivalence, and (where applicable) Lean compilation |

These limitations are release-report requirements, not optional wording. A passing
metadata or shape check must never be presented as a scientific, formal, or
empirical proof.

## 2.2 AI-generated code verification pipeline

For every AI-generated circuit or code sample, the test must execute this pipeline:

1. Capture the generated artifact and the model/request ID; do not replace it with
   a hand-written expected answer.
2. Parse and validate the AST/schema, including gate operands, parameters, and
   qubit bounds.
3. Execute the artifact on the target SDK (Qiskit, Cirq, or PennyLane) in an
   isolated environment. Missing SDKs are **blocked**, not passed.
4. Execute the same circuit in the internal state simulator and compare
   probabilities/statevectors within a documented tolerance.
5. Run Giallar optimization and verify equivalence against the pre-optimization
   statevector for multiple inputs and gate orders.
6. For a formal claim, compile the generated Lean 4 code with the pinned toolchain;
   reject `sorry`, `admit`, `axiom`-only proofs, `True` placeholder theorems, and
   compiler-skipped results.
7. Record failures as generated-code defects with the input, output, stderr,
   backend, seed, and minimized reproducer.

This pipeline distinguishes a syntactically valid answer from a correct answer and
is the required control against AI hallucinations.

## 2.4 Evidence required for a hallucination-reduction claim

The project may claim reduced hallucinations only after a fixed, versioned
evaluation set is run against a baseline model/prompt and the guarded pipeline
under the same conditions. The evaluation must include:

1. At least 100 prompts covering quantum facts, circuit generation, SDK code,
   numerical answers, Lean claims, research-paper evidence, and refusal cases.
2. A labeled oracle for each prompt, with source citations or executable expected
   behavior. “Looks correct” or an LLM judge alone is insufficient.
3. Blind scoring by deterministic checks: SDK execution, internal simulation,
   statevector/probability comparison, Giallar equivalence, Lean compilation,
   schema validation, and citation/quote matching where applicable.
4. A baseline run and guarded-pipeline run using the same model, temperature,
   seed policy, and prompt set.
5. Reported counts and confidence intervals for fabricated citations, invalid
   circuits, wrong numerical results, failed compilations, unsupported claims,
   and unsafe tool actions.
6. A predefined acceptance threshold and a statistically justified improvement
   over baseline. A single passing example or a higher test count is not evidence.
7. Saved raw outputs, model/version configuration, evaluator version, failures,
   and reproducible commands. Missing provider access is **blocked**, not passed.

Until these conditions are met, the correct status is:

```text
AI hallucination reduction: NOT PROVEN
Current evidence: behavioral and integration checks only
```

## 2.3 Required variants, not single happy paths

Each relevant feature must include normal, reversed, shuffled, boundary, and invalid
variants where the operation has those dimensions:

* Circuits: forward and reversed control/target, shuffled time steps, disjoint and
  overlapping gates, empty circuits, maximum supported qubits, and invalid indices.
* Collaboration: one through five users, same-room and different-room users,
  simultaneous mutations, ordered mutations, disconnect/reconnect, malformed
  mutations, and unauthorized joins.
* Optimizer: applicable and non-applicable rules, repeated gates, parameterized gates,
  global-phase-equivalent results, and deliberately corrupted candidates.
* Lean: valid theorem, invalid theorem, wrong hypothesis, `sorry`/`admit`, timeout,
  missing toolchain, and a generated theorem whose statement does not match the
  natural-language claim.
* Ising/QEC: zero noise, low noise, above-threshold noise, multiple distances and
  rounds, deterministic seeded fixtures, malformed tensors, and baseline comparison.
* Research evidence: exact quote, altered quote, unsupported claim, missing source,
  conflicting source, and an independently reproducible numerical result.

A feature is not “validated” if only the first happy-path variant passes.

## 3. Behavioral test matrix (100 tests)

Legend: **Existing** means a related check exists today but still needs the assertion
quality described here. **Add** means there is no trustworthy test yet. **P0** blocks
release; **P1** is required before declaring the feature complete.

### A. Quantum state engine (Q01-Q10) — Slide 3

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| Q01 | P0 | Ground-state identity | `server/quantumEngine.ts` | Empty 1-qubit circuit returns exactly `P(0)=1`, `P(1)=0`. | Existing |
| Q02 | P0 | Hadamard probabilities | `server/quantumEngine.ts` | H on `|0>` returns probabilities within a documented tolerance of 0.5/0.5. | Existing |
| Q03 | P0 | Pauli-X transition | `server/quantumEngine.ts` | X maps `|0>` to `|1>` with no leakage. | Add |
| Q04 | P0 | Pauli-Z phase | `server/quantumEngine.ts` | Z changes phase but preserves measurement probabilities and normalization. | Add |
| Q05 | P0 | Bell state support | `server/quantumEngine.ts` | H+CNOT returns only `00` and `11`, each near 0.5. | Existing |
| Q06 | P0 | GHZ support | `server/quantumEngine.ts` | H+CNOT+CNOT returns only `000` and `111`, each near 0.5. | Existing |
| Q07 | P0 | SWAP basis behavior | `server/quantumEngine.ts` | Three CNOTs map each of `01` and `10` to the opposite basis state. | Existing |
| Q08 | P0 | Rotation analytical result | `server/quantumEngine.ts` | `Ry(pi/3)` produces `P(0)=0.75`, `P(1)=0.25` within tolerance. | Existing |
| Q09 | P0 | Normalization invariant | `src/quantum/simulator.ts` | Random valid circuits preserve total probability within `1e-9`. | Existing |
| Q10 | P1 | Invalid gate rejection | `server/quantumEngine.ts` | Unknown gate, negative qubit, and out-of-range qubit return a typed error; no partial result. | Add |

### B. Optimizer and formal rewrites (O01-O10) — Slide 3

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| O01 | P0 | Rule registry completeness | `src/quantum/giallarVerifier.ts` | Exactly the documented rule IDs are registered, with unique IDs. | Existing |
| O02 | P0 | H cancellation | Giallar compiler | HH is removed and optimized circuit is semantically equivalent. | Existing |
| O03 | P0 | X cancellation | Giallar compiler | XX is removed and basis-state outputs match. | Add |
| O04 | P0 | CX cancellation | Giallar compiler | Adjacent identical CX gates are removed. | Existing |
| O05 | P0 | SWAP decomposition | Giallar compiler | Decomposed SWAP matches direct SWAP for all computational basis inputs. | Add |
| O06 | P0 | HZH conjugation | Giallar compiler | HZH has the same statevector up to global phase as X. | Add |
| O07 | P0 | Rotation merge | Giallar compiler | Adjacent RZ angles merge modulo `2*pi`; output is equivalent. | Add |
| O08 | P0 | Disjoint commutation | Giallar compiler | Reordering gates on disjoint qubits preserves statevector. | Add |
| O09 | P0 | Negative optimization case | Giallar compiler | A circuit with no applicable rule is not changed and remains valid. | Add |
| O10 | P0 | Equivalence failure reporting | Giallar compiler | A deliberately corrupted candidate yields `isSemanticsPreserved=false` and a reason. | Add |

### C. Transpilation and diagrams (T01-T10) — Slide 3

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| T01 | P0 | Qiskit Bell output | `src/quantum/transpiler.ts` | Output parses structurally and contains two qubits, H, and CX with correct operands. | Existing |
| T02 | P0 | Cirq Bell output | `src/quantum/transpiler.ts` | Output has valid qubit declarations and correct H/CNOT operations. | Existing |
| T03 | P0 | PennyLane Bell output | `src/quantum/transpiler.ts` | Output has device, qnode, and operations with correct wires. | Existing |
| T04 | P0 | OpenQASM output | transpiler | QASM version, qreg, and gate operands are syntactically valid. | Existing |
| T05 | P1 | Quantikz output | transpiler | Every circuit wire has a row and every gate has a deterministic column. | Existing |
| T06 | P0 | Parameter serialization | transpiler | `Rx/Ry/Rz` parameters survive serialization without locale or rounding corruption. | Add |
| T07 | P0 | Unsupported operation error | transpiler | Unsupported gate returns an explicit error naming the gate and target backend. | Add |
| T08 | P0 | Deterministic output | transpiler | Same AST produces byte-for-byte identical output across repeated calls. | Add |
| T09 | P1 | Diagram SVG safety | `server/diagramEngine.ts` | SVG contains no executable script/event attributes and preserves gate labels. | Add |
| T10 | P1 | Diagram invalid input | `server/diagramEngine.ts` | Invalid qubit/time-step input is rejected rather than generating malformed SVG. | Add |

### D. API contracts and server routes (A01-A10) — Slide 4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| A01 | P0 | Success envelope | `server/apiCatalogRouter.ts` | Successful route returns `data` and `meta.requestId` plus ISO timestamp. | Add |
| A02 | P0 | Error envelope | API router | Invalid input returns `error.code`, `error.message`, and request ID with correct status. | Add |
| A03 | P0 | Simulation route behavior | API router | POST simulation returns the same Bell probabilities as the engine, not just a truthy object. | Existing |
| A04 | P0 | Optimizer route behavior | API router | POST optimize returns reduced circuit, rule IDs, and equivalence result. | Existing |
| A05 | P0 | Transpiler route behavior | API router | POST transpile returns requested backend output and rejects unknown backend. | Existing |
| A06 | P0 | Auth registration validation | API router | Missing username/password is 400; duplicate username is 409; no password is echoed. | Add |
| A07 | P0 | Auth login behavior | API router | Valid login returns session fields; invalid login returns a non-success response. | Add |
| A08 | P1 | Course retrieval contract | API router/database | Course list and single-course responses have stable IDs and required fields. | Add |
| A09 | P1 | Challenge progress persistence | API router/database | Save then read progress returns the same learner/challenge state. | Add |
| A10 | P1 | Route unknown path | Express app | Unknown route returns 404 error envelope, not HTML or success JSON. | Add |

### E. Security and resilience (S01-S10) — Slide 4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| S01 | P0 | Rate limit boundary | `server/rateLimiter.ts` | Exactly max requests pass; the next request is 429. | Add |
| S02 | P0 | Rate limit isolation | rate limiter | Two client IPs have independent counters. | Add |
| S03 | P0 | Forwarded IP parsing | rate limiter | First `x-forwarded-for` address is used consistently. | Add |
| S04 | P0 | Rate limit headers | rate limiter | Limit, remaining, reset, and retry-after headers are correct. | Add |
| S05 | P0 | Window expiry | rate limiter | Requests after the window start a new counter. Use an injected clock, not sleep. | Add |
| S06 | P0 | Nested payload limit | `payloadSecurityGuard` | Oversized strings at any nested depth return 400. | Add |
| S07 | P0 | Payload boundary | `payloadSecurityGuard` | Limit-1 and limit-length payloads pass; limit+1 fails. | Add |
| S08 | P0 | Prototype pollution input | request validation | `__proto__`, `constructor`, and `prototype` payloads cannot mutate server objects. | Add |
| S09 | P1 | JSON parse failure | Express parser | Malformed JSON returns controlled 400 JSON, without process termination. | Add |
| S10 | P1 | Provider outage fallback | `server/vertexAiClient.ts` | Provider timeout/circuit-open returns an explicit retryable error and no fake answer. | Add |

### F. Authentication, persistence, and state (D01-D10) — Slide 4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| D01 | P0 | Password storage | `server/database.ts` | Stored record never contains the plaintext password. | Add |
| D02 | P0 | User isolation | database/API | User A cannot read or update User B's circuit or progress. | Add |
| D03 | P1 | Circuit round trip | database/API | Save/read preserves gate order, parameters, control and target qubits. | Add |
| D04 | P1 | Circuit not found | database/API | Missing circuit returns a typed not-found result. | Add |
| D05 | P1 | Progress idempotency | database/API | Replaying the same progress event does not double-count completion. | Add |
| D06 | P1 | Telemetry schema | database/API | Events contain learner, challenge, event type, and server timestamp. | Existing |
| D07 | P1 | Class aggregation | database/API | Aggregates are computed from persisted events, not hardcoded fixtures. | Add |
| D08 | P1 | Concurrent update safety | database/API | Concurrent progress writes do not lose an update. | Add |
| D09 | P1 | Database outage | database/API | Database failure is surfaced as 503/controlled error; no success-shaped fallback. | Add |
| D10 | P1 | Session restart semantics | `server/systemState.ts` | Ephemeral job/session state is either restored or explicitly reported unavailable after restart. | Add |

### G. Collaboration and asynchronous jobs (C01-C10) — Slide 4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| C01 | P0 | Socket handshake | `server.ts`, Socket.IO | Client connects and receives the expected connection event. | Existing |
| C02 | P0 | Room authorization | collaboration handler | Unauthorized room join is rejected. | Add |
| C03 | P0 | Room isolation | collaboration handler | Event from room A is never delivered to room B. | Existing |
| C04 | P0 | State broadcast | collaboration handler | Valid circuit delta reaches all other room members exactly once. | Existing |
| C05 | P1 | Sender echo policy | collaboration handler | Sender echo behavior is explicit and tested; no duplicate local update. | Add |
| C06 | P1 | Malformed delta | collaboration handler | Invalid gate delta is rejected without crashing the socket server. | Add |
| C07 | P1 | Disconnect cleanup | collaboration handler | Disconnect removes membership and does not retain unbounded room state. | Add |
| C08 | P1 | Async job creation | `systemState.ts` | Job creation returns a unique ID and pending status. | Add |
| C09 | P1 | Async job completion | `systemState.ts` | Completed job returns result exactly once and status is terminal. | Add |
| C10 | P1 | Async job unknown ID | `systemState.ts` | Unknown job returns a controlled not-found error. | Add |

### H. Learning, assessment, and persona workflows (L01-L10) — Slide 4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| L01 | P0 | Bell challenge success | challenge engine/UI | Correct Bell circuit marks the challenge solved. | Existing |
| L02 | P0 | Bell challenge failure | challenge engine/UI | Missing H or wrong control remains unsolved with actionable feedback. | Existing |
| L03 | P1 | GHZ challenge | challenge documents/UI | Correct three-qubit GHZ circuit is accepted; incomplete circuit is rejected. | Add |
| L04 | P1 | SWAP challenge | challenge documents/UI | Both required basis cases pass only when the full SWAP behavior is present. | Add |
| L05 | P1 | Assessment code execution | `AssessmentEngine.tsx` | Submitted code is executed in the configured sandbox and result is based on output. | Add |
| L06 | P0 | Assessment timeout | sandbox/assessment | Infinite or overlong submission terminates with timeout, not a hanging request. | Add |
| L07 | P1 | Assessment grading mode | assessment engine | Objective and subjective answers use their declared grading modes. | Add |
| L08 | P1 | Socratic response contract | `SocraticTutor.tsx`/API | Tutor response includes a question/next step and does not claim unverified computation. | Add |
| L09 | P1 | Instructor insight grounding | API/prompt handler | Every reported metric maps to an aggregated persisted value. | Add |
| L10 | P1 | Accessibility settings | auth/profile/UI | Saved accessibility preference changes the rendered interaction mode. | Add |

### I. Documents, video, and AI integrations (I01-I10) — Slide 4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| I01 | P1 | KaTeX safe rendering | `src/components/MathView.tsx` | Valid formula renders; malformed formula does not crash the UI. | Existing |
| I02 | P0 | HTML sanitization | KaTeX/DOMPurify path | Script/event payload is removed from rendered output. | Existing |
| I03 | P1 | Document claim evidence | paper analyzer | Claim without source evidence is marked unavailable, not accepted. | Existing |
| I04 | P1 | Bounding-box validation | document extraction | Boxes stay within 0-1000 bounds and preserve coordinate order. | Existing |
| I05 | P1 | Invalid bounding box | document extraction | Negative, inverted, and non-numeric boxes are rejected. | Add |
| I06 | P1 | Video session lifecycle | `VideoAnalyzer.tsx`/API | Start, frame query, and close use one session ID and reject closed sessions. | Add |
| I07 | P1 | Neighbor-frame requirement | video analysis | Frame analysis requests nearest available frames and reports missing frames explicitly. | Add |
| I08 | P1 | AI response parse failure | `server/jsonHelper.ts` | Invalid model JSON returns a typed parse error; it is never silently repaired into false data. | Add |
| I09 | P1 | Prompt injection boundary | AI handlers | User content cannot override system constraints or produce unvalidated tool calls. | Add |
| I10 | P1 | Provider retry policy | `vertexAiClient.ts` | Retryable errors retry within the configured bound; non-retryable errors do not retry. | Add |

### J. Sandboxing, formal verification, and release behavior (F01-F10) — Slides 3/4

| ID | Priority | Test title | Target | Required observable assertion | Status |
|---|---|---|---|---|---|
| F01 | P0 | Sandbox command allowlist | `server/firecrackerSandbox.ts` | Disallowed command/file access is blocked and logged as a failure. | Add |
| F02 | P0 | Sandbox resource limit | Firecracker/microVM route | CPU/memory/time limit terminates runaway work with a typed status. | Existing |
| F03 | P0 | Sandbox output capture | sandbox route | stdout, stderr, exit code, and timeout state are returned separately. | Add |
| F04 | P0 | Snapshot isolation | microVM route | Writes in one run are not visible in the next run. | Existing |
| F05 | P1 | Lean theorem rejection | `server/leanAutoformalizer.ts` | Invalid theorem does not receive a verified status. | Add |
| F06 | P1 | Lean theorem success | Lean engine | A known checked theorem returns compiler success and proof output. | Existing |
| F07 | P1 | Verification sidecar integrity | API responses | Confidence/verification fields are derived from execution, not constants. | Add |
| F08 | P0 | Runner failure propagation | `tests/run_all_tests.ts` | One failed assertion or thrown suite sets process exit code 1. | Existing (fixed) |
| F09 | P0 | No fake success fallback | all server handlers | Provider/database/sandbox failures never return HTTP 2xx with fabricated data. | Add |
| F10 | P0 | Regression gate | package scripts | `npm test` runs every registered suite and fails on any failed case. | Existing (fixed) |

**Matrix total: 100 behavioral tests.** Build, package, credential, hardware,
dependency, and service-reachability checks are intentionally excluded from this
count.

## 4. Test implementation contract

Every matrix row must be implemented as an executable test with:

1. A stable ID in the test name (`Q01`, `A06`, etc.).
2. Arrange/act/assert against the real exported function, HTTP route, socket
   connection, database adapter, or sandbox boundary.
3. At least one negative assertion where the feature accepts input.
4. Deterministic fixtures and injected clocks/randomness for probabilities,
   rate windows, retries, and asynchronous jobs.
5. A failure message containing the expected value, actual value, and target.
6. Cleanup of sockets, timers, temporary files, database rows, and child processes.
7. No assertion that only checks `typeof value`, string inclusion, array length,
   registry labels, or a hardcoded “verified” flag unless paired with execution
   evidence.

For probabilistic quantum tests, use a deterministic statevector assertion when the
engine exposes one. If only shots are available, use a fixed seed, a documented
sample size, and a confidence/tolerance rationale. Never test a quantum claim by
assigning the theoretical answer directly in the test.

## 5. Required test layout

Keep the existing lightweight runner or migrate to a test framework only if the
same IDs and exit behavior are preserved:

```text
qubitlearn-app/tests/
  quantum_state_engine_test.ts
  giallar_formal_rules_test.ts
  transpiler_ast_test.ts
  api_contracts_test.ts
  security_rate_limiter_test.ts
  persistence_auth_test.ts
  collaboration_jobs_test.ts
  learning_assessment_test.ts
  ai_document_video_test.ts
  sandbox_formal_release_test.ts
```

The new files may contain helpers, but helpers are not tests. The master runner
must import each suite, aggregate case-level counts, print failing IDs, and return
exit code 1 for any failure.

## 6. Release gates

Run these in order:

```powershell
Set-Location 'D:\Jan 2025\Downloads\QubitLearnAI\qubitlearn-app'
npm test
npm run build
```

Then run integration suites requiring explicitly configured services. A missing
credential or unavailable external service is **blocked**, not **passed**:

```powershell
npm run start
# In a separate process, run the HTTP/socket integration suite.
```

Do not report the old 64 toolchain checks as product coverage. Record them in a
separate release-gate report with environment, command, timestamp, and raw output.

## 7. Definition of done

The test work is complete only when all 100 rows have an executable implementation,
all P0 rows pass, P1 rows have either passed or an approved issue, `npm test` fails
on any failed row, and no row relies on fake providers, placeholder data, disabled
assertions, or bypassed authentication/sandbox boundaries.
