---
id: 0026
title: The scaled triangular solvers compute zero column norms for a negative matrix stride
status: open
area: base
opened: 2026-11-18
---

## Problem

`dlatps`/`zlatps`, `dlatrs`/`zlatrs` and `dlatbs`/`zlatbs` compute the column norms `CNORM` (when `normin='no'`) with `dasum`/`dzasum`. Like reference BLAS, those return 0 for a non-positive stride. So whenever the matrix is addressed with a negative stride, every column norm comes back 0, and the growth bound is computed from the wrong values. On well-scaled inputs, the unscaled fast path happens to give the right answer anyway. On inputs that need rescaling, the result is wrong or overflows, and the `CNORM` output is wrong regardless.

The reference routines have no matrix stride, so a negative stride is a JS-only extension. Either it is in the contract and the norms must be computed for it, or it is out of contract and the wrappers should reject it (ticket 0017). Right now it is silently accepted and partly wrong.

## Evidence

- `lib/lapack/base/zlatps/lib/base.js` CNORM loops (`dzasum( …, AP, strideAP, … )`), and the equivalent loops in the other five routines.
- Stress sweep from the tickets/0019 work: with packed stride −1 or −2, `zlatps` `normin='no'` disagrees with stride 1 in 3,900 of 8,400 cases (CNORM output, and `x` on the rescaling path).
- LEARNINGS.md 2026-07-17 zlatps strideAP entry claimed bit-exactness at strides −1/−2; that holds only on the fast path (correction noted there).
- `lib/lapack/base/zlatps/test/test.validate.js` excludes negative packed strides from its layout fuzz because of this.

## Reproduce

```bash
node --input-type=module -e "
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatps from './lib/lapack/base/dlatps/lib/ndarray.js';
const AP = new Float64Array( [ 4, 1, 2, 1, 3, 5 ] );
for ( const [ s, o ] of [ [ 1, 0 ], [ -1, 5 ] ] ) {
  const ap = ( s > 0 ) ? AP : AP.slice().reverse();
  const CNORM = new Float64Array( 3 );
  dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, ap, s, o, new Float64Array( [ 1, 1, 1 ] ), 1, 0, new Float64Array( 1 ), CNORM, 1, 0 );
  console.log( 'strideAP=' + s, 'CNORM=', Array.from( CNORM ) );
}"
# strideAP=1  CNORM= [ 0, 1, 4 ]
# strideAP=-1 CNORM= [ 0, 0, 0 ]
```
