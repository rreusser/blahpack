---
id: 0045
title: Tests cannot tell whether code after an early loop exit should run, and coverage hides it
status: open
area: harness
opened: 2026-11-18
---

## Problem

When a Fortran `GO TO` leaves a loop, the translation has to decide at that exit whether the code between the loop end and the label runs. A plain `break` runs it. Nothing checks that the tests can tell the two choices apart, and line coverage says they can: a wrongly translated exit can be 100% covered and pass every test whenever no test input makes the skipped statement change the result.

## Evidence

- The `*latrs`/`*latps`/`*latbs` growth-bound bug (LEARNINGS 2026-11-18, fixed in 57427401): the faulty `break` was covered in all six routines, but only by singular or tiny-diagonal inputs, where `xbnd` had already collapsed to 0, so running `grow = xbnd` was harmless.
- `python bin/goto-exits.py --translated`: 154 Fortran sites in 65 translated routines exit a loop past code (131 past-code, 19 multi-level, 4 cycle-outer).
- `node bin/break-mutants.mjs zlatrs` against the pre-fix `zlatrs` and its old tests: the `skip-after-break` mutant at the bug site survives. On the fixed family, all non-equivalent mutants are killed.
- Sweep and triage of every translated routine whose Fortran has such exits (38 routines with JS break sites; the tool also follows the exit out of `if` branches): 193 mutants, of which 136 are killed, 56 are equivalent with recorded proofs (`test/break-mutants.equivalent.json`), 1 is unreachable (`dlasq2` INFO = 2), and 0 are unexplained.
- Real bugs found by, or during, the triage, all fixed with tests that fail on the old code (LEARNINGS 2026-11-18):
  - the `*latrs`/`*latps`/`*latbs` growth bound (6 routines);
  - the `dsterf` QR deflation, where a completion guard also fired on a break;
  - the `zgsvj1` convergence threshold;
  - the `dlaqr4` IPARMQ parameters and the `dlaqr0` shift count (tickets/0046).
- About 40 test gaps closed. Examples: `zsteqr` had no scaled-input tests; `dlaein` had no complex-eigenvalue tests; the careful path was untested for 5 of the 6 scaled triangular solvers.

## Remaining

- Full-corpus run (2026-11-19; the other 874 modules): 119 have break sites, giving 220 mutants. 136 are killed; 84 survive in 68 routines, not yet triaged. They cluster into families:
  - `lstres = 0.0` after the refinement loop in about 19 `*rfs` routines;
  - `if ( ainvnm !== 0.0 )` in 12 `*la_*cond*` routines;
  - `if ( !bail )` in 8 `*con` routines;
  - `FERR[…]` in 6 triangular/tridiagonal `*rfs` routines;
  - `kk = k ± kstep ∓ 1` in 6 `*sytrf_rk`/`*hetrf_rk` panel routines;
  - `x_state` in 3 `*la_*rfsx_extended` routines;
  - plus singletons (`dlar1v`/`zlar1v`, `dhsein`, `*gebal`, `dlasq3`/`dlasq4`, `dlarrb`/`dlarrf`/`dlarrj`/`dlarrr`, `dlarft`, `drscl`/`zdrscl`, …).
- Wave 1 (2026-11-19) triaged the 52 family survivors. It closed 48 test gaps and fixed `zlasyf_rk` and `dpocon`/`dppcon`/`dpbcon`/`zpbcon` (LEARNINGS). It also exposed two tool flaws, both now fixed: wrapping a `const` declaration caused false kills, and a loop with several breaks got only one mutant for all of them.
- Full rerun of all 912 modules with the fixed tool: 540 mutants, of which 361 are killed (9 by timeout), 59 explained, and 120 unexplained in 62 routines:
  - 60 in already-triaged routines, almost all the new per-break mutants;
  - 28 never surfaced before, including 12 `ainvnm` guards in `*sycon`/`*hecon`/`*spcon` that were previously false kills;
  - 32 one-offs from the earlier backlog.
- 2026-11-20, after merging main: main's JSDoc codemods shifted line numbers, and 46 of the 59 line-keyed proofs silently stopped matching. Proofs are now keyed by a fingerprint of the loop and the statement after it, so unrelated edits don't affect them; a code change invalidates them exactly when it should. Migrating at the last commit where all 59 matched and re-running on main: 33 proofs are current. 26 (in `*gsvj0`/`*gsvj1`, `dhgeqz`, `dlaein`, `dlaqr0`/`dlaqr4`, `dlasq2`, `dtgsja`/`ztgsja`, `zla_gerfsx_extended`) are about code that main's spec work actually changed, and must be re-verified; `--check` reports them as stale until then. Alongside them, 120 survivors in 62 routines are still unexplained.
- Wave 2a (2026-11-20, branch `slop/gracious-dijkstra-q3yg0i`): the condition-estimator (22 routines), tridiagonal (4), Jacobi SVD (4) and QR/QZ/SVD-driver (13) families are clean, with 0 unexplained and 0 stale. 36 test gaps were closed and every stale proof was re-verified. Two non-convergence deviations went to ticket 0052. One survivor has no known reaching input, the `dsterf` QR iteration-limit exit (ticket 0051); it keeps the gate failing for `dsterf` until that ticket is resolved. Left: wave 2b, 51 survivors and 3 stale proofs in 27 routines (MRRR/dqds helpers and singletons).
- A tolerated-survivor list would let the check be gated now, but that is a baseline, which CONVENTIONS T5 forbids, so there is none.
- Gated (2026-11-20): CI job `mutants` runs `node bin/break-mutants.mjs --changed --check` (CONVENTIONS X2). A PR that changes a module must leave no unexplained survivor and no stale proof in it; there is no tolerated-survivor list. What remains of this ticket is everything unchanged since: the 120 untriaged survivors and 26 stale proofs above, which must be triaged before a PR touches their modules or as wave 2. The dlasq2 INFO = 2 survivor is no longer exempted ("UNREACHABLE" was removed as an exemption category); it is tracked as ticket 0051.
- Equivalence keys use line numbers, so an edit that moves a break re-surfaces its entry as unexplained. That is deliberate (it forces a re-check), but noisy.

## Reproduce

```bash
python bin/goto-exits.py --translated | tail -1
git checkout 57427401~1 -- lib/lapack/base/zlatrs
node bin/break-mutants.mjs zlatrs   # SURVIVED at base.js:298 (the bug)
git checkout HEAD -- lib/lapack/base/zlatrs
```
