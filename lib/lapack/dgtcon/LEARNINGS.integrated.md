# dgtcon: Translation Learnings

## Translation pitfalls

- dgtcon uses reverse-communication via dlacn2 (like dsycon/dgecon), but is simpler because the inner solve is just dgttrs (no triangular solve + scaling like dgecon).
- The norm parameter maps to kase1: 'one-norm' -> kase1=1 (solve A*x=b), 'infinity-norm' -> kase1=2 (solve A^T*x=b). When KASE matches kase1, use 'N' (no transpose); otherwise use 'T' (transpose).

## Dependency interface surprises

- dgttrs uses short-form strings ('N', 'T') for the trans parameter, while the outer dgtcon API uses long-form ('one-norm', 'infinity-norm'). Must translate at the interface.
- dlacn2 takes ISGN (Int32Array) as an extra parameter compared to zlacn2. The IWORK array serves double duty as both ISGN for dlacn2 and the workspace.

## Automation opportunities

- The reverse-communication pattern (dlacn2 loop + inner solve) is shared by dsycon, dgecon, and dgtcon. Could be abstracted into a helper.

## Coverage gaps

- 100% line and branch coverage. Both one-norm and infinity-norm paths are tested, plus singular and edge cases.

## Complex number handling

- N/A. dgtcon is a real-only routine.
