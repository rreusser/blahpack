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
* Converts a complex double precision matrix to a complex single precision matrix.
*
* @module @stdlib/lapack/base/zlag2c
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlag2c = require( '@stdlib/lapack/base/zlag2c' );
*
* var A = new Complex128Array( [ 1.5, -2.25, 3.125, 4.0, -0.5, 0.75, 100.0, -200.0 ] );
* var SA = new Complex128Array( 4 );
*
* var info = zlag2c( 'column-major', 2, 2, A, 2, SA, 2 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlag2c.ndarray" }
