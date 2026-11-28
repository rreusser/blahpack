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
* Compute a QR factorization of a complex M-by-N matrix using the compact WY representation of Q.
*
* ## Notes
*
* -   The factorization is computed via Householder reflections (unblocked algorithm) and produces both `V` and the block reflector `T` in a single pass.
* -   `Q` is implicitly represented as `Q = I - V * T * V^H`, where `V^H` denotes the conjugate transpose of `V`. The reflector vectors are stored in the strict lower triangle of `A` with implicit unit diagonals.
* -   The last column of `T` (`T(:, N-1)`) is used internally as workspace during reflector application; it is overwritten before exit.
*
* @module @rreusser/blahpack/lapack/zgeqrt2
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqrt2 from '@rreusser/blahpack/lapack/zgeqrt2';
*
* var A = new Complex128Array( [ 2.0, 0.5, 1.0, -0.3, 3.0, 0.2, 1.0, -0.4, 1.0, -0.2, 4.0, 0.4, 2.0, 0.1, 3.0, -0.2, 3.0, 0.1, 2.0, -0.1, 5.0, 0.3, 1.0, 0.5 ] );
* var T = new Complex128Array( 9 );
*
* zgeqrt2( 'column-major', 4, 3, A, 4, T, 3 );
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqrt2 from '@rreusser/blahpack/lapack/zgeqrt2';
*
* var A = new Complex128Array( [ 2.0, 0.5, 1.0, -0.3, 3.0, 0.2, 1.0, -0.4, 1.0, -0.2, 4.0, 0.4, 2.0, 0.1, 3.0, -0.2, 3.0, 0.1, 2.0, -0.1, 5.0, 0.3, 1.0, 0.5 ] );
* var T = new Complex128Array( 9 );
*
* zgeqrt2.ndarray( 4, 3, A, 1, 4, 0, T, 1, 3, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqrt2 from './zgeqrt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqrt2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgeqrt2 & { ndarray: typeof ndarray }} */ ( zgeqrt2 );
export { ndarray };
