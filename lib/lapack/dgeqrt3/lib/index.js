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
* Recursively computes a QR factorization of a real `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* ## Notes
*
* -   Requires `M >= N`.
* -   On exit, the elements on and above the diagonal of `A` contain the `N`-by-`N` upper triangular matrix `R`; the elements below the diagonal are the columns of `V` defining the elementary reflectors. The implicit `1`s on the diagonal of `V` are not stored.
* -   On exit, the elements on and above the diagonal of `T` contain the `N`-by-`N` upper triangular block reflector factor; the elements below the diagonal are not used.
* -   Based on the algorithm of Elmroth and Gustavson, _IBM J. Res. Develop._ Vol 44 No. 4, July 2000.
*
* @module @rreusser/blahpack/lapack/dgeqrt3
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeqrt3 from '@rreusser/blahpack/lapack/dgeqrt3';
*
* var A = new Float64Array( [ 2.0, 1.0, 0.5, 0.5, 3.0, 1.5 ] );
* var T = new Float64Array( 4 );
*
* dgeqrt3( 'column-major', 3, 2, A, 3, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqrt3 from './dgeqrt3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqrt3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgeqrt3 & { ndarray: typeof ndarray }} */ ( dgeqrt3 );
export { ndarray };
