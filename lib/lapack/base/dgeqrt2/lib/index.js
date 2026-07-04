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
* @module @stdlib/lapack/base/dgeqrt2
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgeqrt2 = require( '@stdlib/lapack/base/dgeqrt2' );
*
* var A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 1.0, 4.0, 2.0, 3.0, 3.0, 2.0, 5.0, 1.0 ] );
* var T = new Float64Array( 9 );
*
* dgeqrt2( 'column-major', 4, 3, A, 4, T, 3 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgeqrt2 = require( '@stdlib/lapack/base/dgeqrt2' );
*
* var A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 1.0, 4.0, 2.0, 3.0, 3.0, 2.0, 5.0, 1.0 ] );
* var T = new Float64Array( 9 );
*
* dgeqrt2.ndarray( 4, 3, A, 1, 4, 0, T, 1, 3, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgeqrt2.ndarray" }
