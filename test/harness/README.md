# Validation Harness

Rigorous, property-based validation for the translated BLAS/LAPACK routines.

Fixture tests answer "does this one hand-picked case match?" — they cannot answer
"is this routine correct?" The two bug classes that reached production (off-by-one
indexing and wrong large-matrix branches) are exactly what tame, small,
unit-stride, zero-offset fixtures cannot see. This harness attacks correctness
directly: it generates structured inputs across the sizes and layouts that
exercise a routine's branch structure, and validates outputs by their
**mathematical properties** against an **independent** oracle.

## Design: three orthogonal layers

The library's routines span a taxonomy of `(element type × structure × storage)`,
encoded in the BLAS name (`[d|z]` + `[ge|gb|sy|sb|sp|he|hb|hp|tr|tb|tp|po|pb|pp|…]`).
The harness mirrors that taxonomy with three independent seams so nothing is
special-cased:

| Layer | File | Responsibility |
|---|---|---|
| **Scalar trait** | `scalar.js` | the real↔complex seam: element storage, arithmetic, conjugation, exact-equality. Hermitian collapses to symmetric for real automatically. |
| **Logical matrix** | `logical.js` | storage-agnostic mathematical objects + structured constructors (general, symmetric, Hermitian, SPD/HPD, triangular, banded, SPD-banded). |
| **Storage scheme** | `schemes.js` | pluggable physical realization: `dense` (ge/sy/he/tr), `banded` (gb/sb/hb/tb/pb), `packed` (sp/hp/tp), and vectors. Each realizes a logical matrix into a **poisoned** buffer and yields the routine's `(stride…, offset)` arguments. |

Supporting: `reference.js` (independent naive math — the honest oracle),
`norms.js`, `checks.js` (the assertion vocabulary), `invariance.js` (layout-
invariance driver), `rng.js` (seeded, reproducible), `ledger.js` (validation-level
recording).

### Two mechanisms that make this bite

- **Poisoned storage.** Every unused backing slot — padding rows, gaps, the
  unreferenced triangle, an implicit unit diagonal, out-of-band entries — is
  pre-filled with `NaN`. If a routine reads a byte it shouldn't (the off-by-one
  class), the `NaN` propagates into the output and `assertFinite` fails loudly.
  Silent memory corruption becomes a guaranteed, visible failure. (This caught a
  bug in the harness's own packed indexing on day one — see `LEARNINGS.md`.)

- **Layout invariance = bit-exact.** Changing an operand's offset, stride, leading
  dimension, or storage order (column- vs row-major) changes *addressing*, never
  *arithmetic order* — so a correct routine must return a **bit-for-bit identical**
  result. `invariance.js` fixes the seed (identical values), re-runs under every
  layout the scheme allows, and asserts `Object.is`-equality. This is the highest-
  signal, cheapest test for the offset/stride bug class.

## Validation-level ladder

Each routine earns a level from checks that **actually ran and passed** — recorded
at runtime in the ledger, so empty assertions earn nothing:

| Level | Meaning |
|---|---|
| **L0** unvalidated | only export/structure checks |
| **L1** fixture | fixed reference-value tests |
| **L2** property | independent residual / reconstruction / structural / orthogonality |
| **L3** layout-fuzzed | L2 + bit-exact invariance across storage layouts |
| **L4** cross/diff | L2/3 + cross-validation vs trusted routines and/or differential vs reference Fortran |

```bash
node bin/validation-level.js            # per-routine level table
node bin/validation-level.js --badges   # shields.io badge markdown (for module pages)
node bin/validation-level.js --md       # markdown table (for the progress report)
```

## Writing a validation test

```js
// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpotrf from './../lib/ndarray.js';

for ( const sc of [ S.real /*, S.complex for z-routines */ ] ) {
  for ( const uplo of [ 'upper', 'lower' ] ) {
    for ( const n of SIZES_SMALL ) {
      const rng = new RNG( 0x100 + n );          // reproducible; log this seed in LEARNINGS on failure
      const A = logical.positiveDefinite( sc, rng, n );
      const R = schemes.dense.realize( sc, A, { part: uplo }, schemes.dense.layouts()[0] );
      dpotrf( uplo, n, R.data, ...R.args );        // in-place factorization
      const F = /* read factor triangle back via R.read(i,j) */;
      const recon = ref.matmul( sc, F, F, uplo === 'upper' ? { transa: 'c' } : { transb: 'c' } );
      checked( 'dpotrf', 'reconstruct', () => check.assertReconstruct( sc, recon, A ) );
    }
  }
}
```

`checked(routine, kind, fn)` records the level only if `fn` (a real assertion)
passes. See `test.harness.js` for full working examples across all three schemes,
both scalars, and a layout-invariance fuzz.

## When a check fails: log it (mandatory)

**Every defect the harness surfaces gets an entry in `LEARNINGS.md` before/with the
fix** — bugs in a routine *and* bugs in the harness. Include the reproducing seed,
scalar type, storage scheme, flags, dimensions, root cause, bug class, and where
else the same mistake might hide. This log is what makes the harness actionable
rather than decorative. Do not fix silently.
```
