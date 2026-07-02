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
* Add a vector to a doubled-single precision accumulator (X, Y).
*
* @module @stdlib/lapack/base/dla-wwaddw
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_wwaddw = require( '@stdlib/lapack/base/dla-wwaddw' );
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw( 3, x, 1, y, 1, w, 1 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_wwaddw = require( '@stdlib/lapack/base/dla-wwaddw' );
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw.ndarray( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_wwaddw.ndarray" }
