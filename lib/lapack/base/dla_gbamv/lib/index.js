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
* Performs a matrix-vector operation to calculate error bounds on banded matrices.
*
* @module @stdlib/lapack/base/dla_gbamv
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_gbamv = require( '@stdlib/lapack/base/dla_gbamv' );
*
* var AB = new Float64Array( [ 0.0, 1.0, 3.0, -2.0, 4.0, -6.0, -5.0, 7.0, -9.0, 8.0, 10.0, 0.0 ] );
* var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
* var y = new Float64Array( 4 );
*
* dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, AB, 3, x, 1, 0.0, y, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_gbamv.ndarray" }
