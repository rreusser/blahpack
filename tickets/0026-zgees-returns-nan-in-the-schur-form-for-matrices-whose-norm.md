---
id: 0026
title: zgees returns NaN in the Schur form for matrices whose norm is below about 1e-140
status: open
area: base
opened: 2026-11-20
---

## Problem

`zgees` returns `info = 0` with NaN entries in the strict upper triangle of the Schur form `A` (and in `VS` when vectors are computed) whenever the input's max-abs norm is below `smlnum` (`sqrt(safmin)/eps`, about 6.7e-139). That is the `scalea` path, which scales `A` up to `smlnum` before the QR iteration. Real `dgees` handles the same inputs correctly. A silent NaN with `info = 0` is the worst failure mode: nothing tells the caller the result is garbage.

## Evidence

- Found 2026-11-20 while building layout tests for the stride-provenance rule (Step 4), in the canonical layout. It's not a layout or stride bug.
- Input norm 1, 1e-100 and 1e150: finite. Input norm 1e-140 and 1e-150: NaN, with `sort` either `'none'` or `'sort'`, and with or without vectors.
- `zlascl` itself scales correctly between these magnitudes (checked directly for `'general'`, `'upper'` and `'lower'`), so the NaN is produced earlier, in the balance/Hessenberg/`zhseqr` stage on the `smlnum`-sized matrix.
- Next step: bisect `zgebal` → `zgehrd` → `zhseqr` on the scaled matrix against the reference Fortran (`test/run_fortran.sh`), then record the root cause in `test/harness/LEARNINGS.md`.

## Reproduce

```bash
node --input-type=module -e "
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgees from './lib/lapack/base/zgees/lib/ndarray.js';
const N = 5; let s = 12345; const r = () => ( s = ( s * 1103515245 + 12345 ) % 2147483648 ) / 2147483648 - 0.5;
const A = new Complex128Array( Float64Array.from( { length: 2*N*N }, () => r() * 1e-150 ) );
const info = zgees( 'no-vectors', 'none', () => false, N, A, 1, N, 0, new Int32Array( 1 ), new Complex128Array( N ), 1, 0, new Complex128Array( N*N ), 1, N, 0, new Complex128Array( 10*N ), 1, 0, new Float64Array( N ), 1, 0, new Uint8Array( N ), 1, 0 );
console.log( 'info', info, 'finite', new Float64Array( A.buffer ).every( Number.isFinite ) );
"
```
