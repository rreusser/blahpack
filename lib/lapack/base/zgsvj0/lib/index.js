/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/**
* Pre-processor for `zgesvj` performing Jacobi rotations.
*
* @module @stdlib/lapack/base/zgsvj0
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zgsvj0 = require( '@stdlib/lapack/base/zgsvj0' );
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* var A = new Complex128Array( [ 1, 0.5, 2, -0.5, 3, 1, 4, -1, 5, 0.25, 6, -0.25, 7, 0.75, 8, -0.75, 9, 0, 10, 0.1, 11, -0.2, 12, 0.3 ] );
* var d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
* var sva = new Float64Array( [ 5.5, 13.3, 21.4 ] );
* var V = new Complex128Array( 1 );
* var work = new Complex128Array( 4 );
*
* var info = zgsvj0( 'column-major', 'no-v', 4, 3, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
* // returns <integer>
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgsvj0.ndarray" }
