/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/**
* Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* @module @stdlib/lapack/base/zgsvj1
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zgsvj1 = require( '@stdlib/lapack/base/zgsvj1' );
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
* var info = zgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
* // returns <integer>
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgsvj1.ndarray" }
