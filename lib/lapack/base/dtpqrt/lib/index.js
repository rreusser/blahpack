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
* Compute a blocked QR factorization of a real triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* @module @stdlib/lapack/base/dtpqrt
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dtpqrt = require( '@stdlib/lapack/base/dtpqrt' );
*
* var A = new Float64Array( [ 2.0, 0.0, 0.5, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* dtpqrt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtpqrt.ndarray" }
