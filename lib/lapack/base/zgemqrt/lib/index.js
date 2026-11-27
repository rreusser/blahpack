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
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact WY representation produced by `zgeqrt`.
*
* ## Notes
*
* -   The `WORK` buffer should provide at least `ldwork * nb` complex elements where `ldwork = max(1,N)` for `side='left'` or `max(1,M)` for `side='right'`. If the buffer is too small, an internal scratch array is allocated.
* -   `V` and `T` must come from a prior call to `zgeqrt` with the same block size `nb`.
* -   Strides and offsets are expressed in complex elements (not in real-valued slots).
*
* @module @rreusser/blahpack/lapack/base/zgemqrt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgemqrt from '@rreusser/blahpack/lapack/base/zgemqrt';
*
* var V = new Complex128Array( 12 );
* var T = new Complex128Array( 6 );
* var C = new Complex128Array( 16 );
* var WORK = new Complex128Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* zgemqrt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgemqrt from './zgemqrt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgemqrt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgemqrt & { ndarray: typeof ndarray }} */ ( zgemqrt );
export { ndarray };
