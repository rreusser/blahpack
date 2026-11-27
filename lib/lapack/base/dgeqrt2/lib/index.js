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
* Compute a QR factorization of a real M-by-N matrix using the compact WY representation of Q.
*
* ## Notes
*
* -   The factorization is computed via Householder reflections (unblocked algorithm) and produces both `V` and the block reflector `T` in a single pass.
* -   `Q` is implicitly represented as `Q = I - V * T * V^T`. The reflector vectors are stored in the strict lower triangle of `A` with implicit unit diagonals.
* -   The last column of `T` (`T(:, N-1)`) is used internally as workspace during reflector application; it is overwritten before exit.
*
* @module @rreusser/blahpack/lapack/base/dgeqrt2
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeqrt2 from '@rreusser/blahpack/lapack/base/dgeqrt2';
*
* var A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 1.0, 4.0, 2.0, 3.0, 3.0, 2.0, 5.0, 1.0 ] );
* var T = new Float64Array( 9 );
*
* dgeqrt2( 'column-major', 4, 3, A, 4, T, 3 );
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeqrt2 from '@rreusser/blahpack/lapack/base/dgeqrt2';
*
* var A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 1.0, 4.0, 2.0, 3.0, 3.0, 2.0, 5.0, 1.0 ] );
* var T = new Float64Array( 9 );
*
* dgeqrt2.ndarray( 4, 3, A, 1, 4, 0, T, 1, 3, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqrt2 from './dgeqrt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqrt2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgeqrt2 & { ndarray: typeof ndarray }} */ ( dgeqrt2 );
export { ndarray };
