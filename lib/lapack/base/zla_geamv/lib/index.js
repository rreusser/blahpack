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
* Computes `y := alpha*|A|*|x| + beta*|y|` using a general complex matrix to calculate error bounds.
*
* @module @stdlib/lapack/base/zla_geamv
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zlaGeamv = require( '@stdlib/lapack/base/zla_geamv' );
*
* var A = new Complex128Array( [ 1.0, 0.0, -2.0, 0.0, 3.0, 0.0, -4.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* zlaGeamv( 'row-major', 'no-transpose', 2, 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_geamv.ndarray" }
