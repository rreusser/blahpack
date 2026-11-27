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
* Apply a complex unitary matrix Q (or its conjugate-transpose Q^H) from a TSQR factorization (`zlatsqr`) to a complex M-by-N matrix C.
*
* ## Notes
*
* -   The four `(side, trans)` combinations:
*
*     ```text
*                                           SIDE = 'left'   SIDE = 'right'
*     TRANS = 'no-transpose':                    Q*C            C*Q
*     TRANS = 'conjugate-transpose':           Q^H*C          C*Q^H
*     ```
*
* -   When `mb <= K` or `mb >= max(M, N, K)` the routine defers to `zgemqrt` on the whole panel (no pentagonal blocks).
*
* -   When `WORK` is undersized (or empty) the underlying `zgemqrt`/`ztpmqrt` allocate an internal buffer; correctness is preserved, only performance is affected.
*
* @module @rreusser/blahpack/lapack/base/zlamtsqr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlamtsqr from '@rreusser/blahpack/lapack/base/zlamtsqr';
*
* var A = new Complex128Array( 8 );
* var T = new Complex128Array( 2 );
* var C = new Complex128Array( 8 );
* var WORK = new Complex128Array( 2 );
*
* // C is overwritten with Q^H * C in column-major layout.
* zlamtsqr.ndarray( 'left', 'conjugate-transpose', 4, 2, 2, 8, 1, A, 1, 4, 0, T, 1, 1, 0, C, 1, 4, 0, WORK, 1, 0, WORK.length );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlamtsqr from './zlamtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlamtsqr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlamtsqr & { ndarray: typeof ndarray }} */ ( zlamtsqr );
export { ndarray };
