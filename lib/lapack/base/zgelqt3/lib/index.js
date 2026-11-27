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
* Recursively computes an LQ factorization of a complex `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* ## Notes
*
* -   Requires `M <= N`.
* -   On exit, the elements on and below the diagonal of `A` contain the `M`-by-`M` lower triangular matrix `L`; the elements above the diagonal are the rows of `V` defining the elementary reflectors. The implicit `1`s on the diagonal of `V` are not stored.
* -   On exit, the elements on and above the diagonal of `T` contain the `M`-by-`M` upper triangular block reflector factor; the elements below the diagonal are not used.
* -   The block reflector is `H = I - V * T * V^H` where `V^H` denotes the conjugate transpose of `V`.
* -   Based on the algorithm of Elmroth and Gustavson, _IBM J. Res. Develop._ Vol 44 No. 4, July 2000.
*
* @module @rreusser/blahpack/lapack/base/zgelqt3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgelqt3 from '@rreusser/blahpack/lapack/base/zgelqt3';
*
* var A = new Complex128Array( [ 2.0, 0.1, 0.5, -0.2, 1.0, 0.3, 3.0, 0.4, 0.5, -0.1, 1.5, 0.2 ] );
* var T = new Complex128Array( 4 );
*
* zgelqt3( 'column-major', 2, 3, A, 2, T, 2 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgelqt3.ndarray" }
