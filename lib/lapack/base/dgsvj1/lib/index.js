/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/**
* Pre-processor for `dgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* @module @stdlib/lapack/base/dgsvj1
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgsvj1 = require( '@stdlib/lapack/base/dgsvj1' );
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
* var d = new Float64Array( [ 1, 1, 1 ] );
* var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
* var V = new Float64Array( 1 );
* var work = new Float64Array( 4 );
*
* var info = dgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
* // returns <integer>
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgsvj1.ndarray" }
