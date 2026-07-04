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
* Converts a double precision matrix to a single precision matrix.
*
* @module @stdlib/lapack/base/dlag2s
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlag2s = require( './../lib' );
*
* var A = new Float64Array( [ 1.25, 2.5, -3.75, 4.125 ] );
* var SA = new Float64Array( 4 );
*
* var info = dlag2s( 'column-major', 2, 2, A, 2, SA, 2 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlag2s.ndarray" }
