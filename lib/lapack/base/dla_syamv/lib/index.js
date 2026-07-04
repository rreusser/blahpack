/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` using a symmetric indefinite matrix to calculate error bounds.
*
* @module @stdlib/lapack/base/dla_syamv
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_syamv = require( '@stdlib/lapack/base/dla_syamv' );
*
* var A = new Float64Array( [ 1.0, -2.0, -2.0, 5.0 ] );
* var x = new Float64Array( [ 1.0, 1.0 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* dla_syamv( 'row-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_syamv.ndarray" }
