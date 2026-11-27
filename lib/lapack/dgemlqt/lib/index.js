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
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact WY representation produced by `dgelqt`.
*
* ## Notes
*
* -   The `WORK` buffer should provide at least `ldwork * mb` elements where `ldwork = max(1,N)` for `side='left'` or `max(1,M)` for `side='right'`. If the buffer is too small, an internal scratch array is allocated.
* -   `V` and `T` must come from a prior call to `dgelqt` with the same block size `mb`.
* -   In the LQ representation produced by `dgelqt`, rows of `V` hold the Householder reflectors. `dgemlqt` therefore drives the underlying block-reflector kernel with row-wise storage and an opposite-sense `trans` per block; the user-visible `(side, trans)` semantics described above are unaffected.
*
* @module @rreusser/blahpack/lapack/dgemlqt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgemlqt from '@rreusser/blahpack/lapack/dgemlqt';
*
* var V = new Float64Array( 12 );
* var T = new Float64Array( 6 );
* var C = new Float64Array( 16 );
* var WORK = new Float64Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* dgemlqt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemlqt from './dgemlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgemlqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgemlqt & { ndarray: typeof ndarray }} */ ( dgemlqt );
export { ndarray };
