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
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact-WY representation produced by `zgelqt`.
*
* ## Notes
*
* -   The `WORK` buffer should provide at least `ldwork * mb` complex elements where `ldwork = max(1,N)` for `side='left'` or `max(1,M)` for `side='right'`. If the buffer is too small, an internal scratch array is allocated.
* -   `V` and `T` must come from a prior call to `zgelqt` with the same block size `mb`.
* -   In the LQ representation produced by `zgelqt`, rows of `V` hold the Householder reflectors. `zgemlqt` therefore drives the underlying block-reflector kernel with row-wise storage and an opposite-sense `trans` per block; the user-visible `(side, trans)` semantics described above are unaffected.
*
* @module @rreusser/blahpack/lapack/base/zgemlqt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgemlqt from '@rreusser/blahpack/lapack/base/zgemlqt';
*
* var V = new Complex128Array( 12 );
* var T = new Complex128Array( 6 );
* var C = new Complex128Array( 16 );
* var WORK = new Complex128Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* zgemlqt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgemlqt from './zgemlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgemlqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgemlqt & { ndarray: typeof ndarray }} */ ( zgemlqt );
export { ndarray };
