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
* Recursively computes a QR factorization of a complex `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* ## Notes
*
* -   Requires `M >= N`.
* -   On exit, the elements on and above the diagonal of `A` contain the `N`-by-`N` upper triangular matrix `R`; the elements below the diagonal are the columns of `V` defining the elementary reflectors. The implicit `1`s on the diagonal of `V` are not stored.
* -   On exit, the elements on and above the diagonal of `T` contain the `N`-by-`N` upper triangular block reflector factor; the elements below the diagonal are not used.
* -   The block reflector is `H = I - V * T * V^H` where `V^H` denotes the conjugate transpose of `V`.
* -   Based on the algorithm of Elmroth and Gustavson, _IBM J. Res. Develop._ Vol 44 No. 4, July 2000.
*
* @module @rreusser/blahpack/lapack/zgeqrt3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqrt3 from '@rreusser/blahpack/lapack/zgeqrt3';
*
* var A = new Complex128Array( [ 2.0, 0.1, 0.7, -0.3, 0.5, 0.3, -1.0, 0.4, 1.5, -0.2, 3.0, 0.5, 1.1, -0.4, 0.4, 0.2 ] );
* var T = new Complex128Array( 4 );
*
* zgeqrt3( 'column-major', 4, 2, A, 4, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqrt3 from './zgeqrt3.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zgeqrt3, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zgeqrt3 & { strided: typeof strided }} */ ( zgeqrt3 );
export { strided };
