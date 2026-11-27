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
* Computes a QR factorization of a real triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix; on exit it contains the upper triangular factor `R`.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M - l` rows are rectangular and whose last `l` rows form an upper trapezoidal block; on exit it contains the Householder reflector representation `V`.
* -   `T` is the `N`-by-`N` upper triangular factor of the compact-WY block reflector.
*
* @module @rreusser/blahpack/lapack/dtpqrt2
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtpqrt2 from '@rreusser/blahpack/lapack/dtpqrt2';
*
* var A = new Float64Array( [ 2.0, 0.0, 0.5, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
* var T = new Float64Array( 4 );
*
* dtpqrt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpqrt2 from './dtpqrt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpqrt2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtpqrt2 & { ndarray: typeof ndarray }} */ ( dtpqrt2 );
export { ndarray };
