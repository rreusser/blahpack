# Optimization & Faithfulness Policy

What blahpack is allowed to change when it makes a routine faster, and what it
must never change. This is the strategic layer above
[performance-patterns.md](performance-patterns.md) (which is the tactical *how*
of writing fast loops). Read this before starting an optimization campaign,
adding a new reference package, or "improving" an algorithm.

## The one-sentence version

blahpack ships *faithful translations of reference implementations*, keyed to
the reference routine they translate; you may optimize **how** a routine
computes its result, but never **which algorithm** computes it, and a faithful
reference must always survive as the verification oracle.

## The unit of faithfulness

A reference routine is not defined by its interface. It is defined by its
documented algorithm **and the dependency tree that realizes it**. `dsbgvx`
*is* "split the pencil (`dsbgst`/`dpbstf`) → reduce band to tridiagonal
(`dsbtrd`) → `dstebz`/`dstein` → back-transform." That call graph is the
routine's identity, not an implementation detail of it.

So the unit we promise to be faithful to is **algorithm + dependency tree,
keyed to a reference routine**. Every node in the tree corresponds to a
reference routine and is independently verifiable against it. A deep tree
(an eigensolver calling ten routines for balancing, factoring, shifting, …)
is a *feature*: it is ten independent verification points. The dgbtrf/zgbtrf
blocked-path bug (2026-07) was caught precisely because that node was
individually checkable against its Fortran reference and its unblocked twin.

## What optimization may change

Optimization restructures the *realization* of a node (or subtree) while
preserving the mathematical meaning the reference documents:

- Reschedule memory and arithmetic: tiling, cache blocking, register
  accumulation, unit-stride specialization, loop unrolling.
- Fuse, inline, or specialize nodes — e.g. inline a `ddot` leaf into a matmul
  kernel — **as long as the subtree still computes the same reference result**
  to the required tolerance.
- Reorder floating-point operations, *only* where the routine is validated by
  backward error rather than bit-identity (see "Two verification tiers").

## What optimization may never do

- **Swap the algorithm.** Replacing a routine's call graph with a different
  mathematical method — e.g. an iterative Krylov shift-invert in place of a
  direct reduction — is not an optimization of that routine even if the outputs
  match. It is a *different routine wearing the same name*, realizing no
  reference, verifiable against nothing.
- **Shortcut the tree.** Collapsing N faithful reference routines into one
  clever hand-rolled routine trades N oracles for zero. Optimize the nodes;
  never delete the tree.
- **Author numerics with no reference.** Bespoke shift selection, convergence
  heuristics, cluster orthogonalization, etc. inside a routine slot have no
  Fortran to check number-for-number against. That is authoring, not
  translating, and it does not belong in a mirror-of-a-reference slot.

## The test to apply at any node

> **Does a reference routine faithfully realize this call graph?**

- **Yes** → you are translating/optimizing that routine. It lives in that
  reference's provenance slot and is verified against that reference.
- **No** (you combined ideas, exploited problem structure, hand-rolled a
  heuristic) → you have **authored**. Do not hide it inside a reference slot.
  Either it maps to a *different* reference package — then translate that
  faithfully in its own slot — or it is genuinely novel, in which case it does
  not belong in the reference-mirror library at all.

## Algorithm selection is a driver concern, not an internal one

"Same information out, different algorithm" (e.g. the lowest eigenpairs of a
banded symmetric pencil via ARPACK shift-invert instead of `dsbgvx`) is not a
paradox once you see that the two algorithms are **two different reference
routines**, and the choice between them lives *above* both:

- `lib/lapack/base/dsbgvx` — faithful, verified against LAPACK.
- `lib/arpack/base/dsaupd` / `dseupd` / `dsband` — faithful, verified against
  arpack-ng.

The **application** (a notebook's solver routing, or a higher-level driver)
picks which faithful routine to call. blahpack stays a clean set of mirrors;
composition happens at the layer that composes.

The same rule covers *structural* shortcuts, which are the tempting gray zone:

- "M is diagonal, so skip `dsbgst` and rescale by `D^{-1/2}`."
- "σ < 0, so `K − σM` is PD — use Cholesky (`dpbtrf`) not pivoted LU
  (`dgbtrf`)."

These are **not** internal rewrites of a routine. They are the driver choosing
a *different faithful routine* because it knows something about the problem.
Correct place (the driver), correct mechanism (select an existing faithful
routine), no bespoke numerics.

## Provenance = directory structure

Which upstream package (and version and license) a routine derives from
determines where it lives — orthogonal to whether its implementation is
faithful or optimized:

- `data/BLAS-3.12.0`, `data/lapack-3.12.0`, `data/arpack-ng-*` — vendored
  reference sources, one tree per package.
- `lib/blas/base/*`, `lib/lapack/base/*`, `lib/arpack/base/*` — translations,
  mirroring the reference trees.

Never scatter one package's routines into another's namespace. A call graph
that faithfully realizes *no* reference routine (because it fuses ARPACK ideas
into a LAPACK slot, say) is the tell that a line has been crossed: nothing can
verify it and it misrepresents its provenance.

## Two verification tiers

Whatever the implementation, a **faithful reference must survive as the
oracle**. Two tiers, by whether the shipped code reorders arithmetic:

1. **Bit-identical.** When a variant only reschedules memory and never reorders
   dependent arithmetic (JS `+`/`*` are single IEEE-754 ops — no FMA
   contraction, no reassociation), it must reproduce the reference output
   bitwise. This is stricter than a tolerance and is the default gate for such
   variants (see the dsbtrd blocking plan).
2. **Backward error.** When a variant genuinely reorders summation (register
   tiling, multi-accumulator kernels), bit-identity is impossible; gate against
   the reference at a documented backward-error tolerance instead (the
   `dgemm-opt` precedent, `TOL = 1e-9`).

In both tiers the reference is preserved and checked, not discarded:

- Fortran-generated fixtures in `test/fixtures/` are compared **element-wise**
  (not via a loose derived property like a solve residual on a friendly
  matrix — that is exactly what hid the dgbtrf bug).
- When the shipped `lib/` code is optimized in place, keep the faithful
  reference kernel as a preserved variant (e.g. `bench/<routine>-opt/variants/
  v0-reference.js`) and gate every optimized variant against it.
- Document deviations from the reference in the module's `DIFFERENCES.md`.

## Checklist before optimizing or extending

- [ ] Is this optimizing an existing routine's realization, or introducing a
      new algorithm? (New algorithm → new reference, new slot, or driver-level
      selection — not an internal rewrite.)
- [ ] Does a reference routine faithfully realize the resulting call graph?
- [ ] Is a faithful reference preserved as the oracle (fixture + reference
      variant), and is the fixture compared element-wise?
- [ ] Which tier gates it — bit-identical or backward error — and is that the
      right one for whether arithmetic is reordered?
- [ ] Is the routine in the provenance slot of the package it derives from?
- [ ] Are deviations recorded in `DIFFERENCES.md`?
