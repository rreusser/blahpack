/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Executes a single multishift QZ sweep on a matrix pencil.
*
* ## Notes
*
* -   The active range is `[ilo, ihi]` using 0-based indices. The pencil `(A, B)` must be in upper Hessenberg / upper triangular form on this range.
* -   `nshifts` is rounded down to an even number internally; if the shifts are not yet paired into complex-conjugate pairs, the routine performs a one-pass shuffle to move unpaired real shifts to the end of the active region before sweeping.
* -   `QC` and `ZC` are workspace square matrices used to accumulate the local Givens rotations before applying them to the trailing pencil via `dgemm`. They are sized `nblockDesired`-by-`nblockDesired`.
* -   `WORK` must hold at least `N * nblockDesired` doubles. Each `dgemm` writes its product into the leading `SHEIGHT * SWIDTH` columns of `WORK`, which is then copied back into the destination block via `dlacpy`.
*
* @module @rreusser/blahpack/lapack/base/dlaqz4
*
* @example
* import dlaqz4 from '@rreusser/blahpack/lapack/base/dlaqz4';
*
* // See `examples/index.js` for a runnable example.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqz4 from './dlaqz4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqz4, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaqz4 & { ndarray: typeof ndarray }} */ ( dlaqz4 );
export { ndarray };
