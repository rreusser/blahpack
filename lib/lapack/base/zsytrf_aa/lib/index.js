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
* Computes the factorization of a complex symmetric matrix using Aasen's algorithm (blocked).
*
* ## Notes
*
* -   `IPIV` stores standard 0-based pivot indices. Aasen's algorithm does NOT use
*     the Bunch-Kaufman negative-IPIV encoding (unlike `zsytrf`, `zsytrf_rk`, or
*     `zsytrf_rook`).
* -   On exit, the complex symmetric tridiagonal `T` is stored on the diagonals of `A`
*     (with sub/superdiagonal stored adjacent), and `L` (or `U`) is stored below
*     (or above) the subdiagonals.
* -   The block size `NB` comes from `ilaenv` (64), as in the reference.
*
* @module @rreusser/blahpack/lapack/base/zsytrf_aa
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsytrfAa from '@rreusser/blahpack/lapack/base/zsytrf_aa';
*
* var A = new Complex128Array( 16 );
* A.set( [ 4, 0 ], 0 );
* A.set( [ 2, 0 ], 1 );
* A.set( [ 1, 0 ], 2 );
* A.set( [ 5, 0 ], 5 );
* A.set( [ 2, 0 ], 6 );
* A.set( [ 6, 0 ], 10 );
* A.set( [ 8, 0 ], 15 );
* var IPIV = new Int32Array( 4 );
*
* var info = zsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
* // info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
