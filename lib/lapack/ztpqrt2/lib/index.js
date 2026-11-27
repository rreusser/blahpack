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
* Computes a QR factorization of a complex triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix; on exit it contains the upper triangular factor `R`.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M - l` rows are rectangular and whose last `l` rows form an upper trapezoidal block; on exit it contains the Householder reflector representation `V`.
* -   `T` is the `N`-by-`N` upper triangular factor of the compact-WY block reflector.
* -   The block reflector `H = I - W * T * W^H` reduces `[A; B]` to `[R; 0]`.
*
* @module @rreusser/blahpack/lapack/ztpqrt2
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztpqrt2 from '@rreusser/blahpack/lapack/ztpqrt2';
*
* var A = new Complex128Array( [ 2.0, 0.1, 0.0, 0.0, 0.5, -0.2, 3.0, 0.3 ] );
* var B = new Complex128Array( [ 1.0, 0.4, 0.3, -0.1, 0.5, 0.2, 1.1, 0.3 ] );
* var T = new Complex128Array( 4 );
*
* ztpqrt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpqrt2 from './ztpqrt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpqrt2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztpqrt2 & { ndarray: typeof ndarray }} */ ( ztpqrt2 );
export { ndarray };
