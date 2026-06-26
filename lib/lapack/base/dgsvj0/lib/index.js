
/**
* Performs one sweep of one-sided Jacobi rotations to drive an `M`-by-`N` matrix toward orthogonal columns (the inner sweep used by `dgesvj`).
*
* @module @stdlib/lapack/base/dgsvj0
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgsvj0 = require( '@stdlib/lapack/base/dgsvj0' );
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
* var d = new Float64Array( [ 1.0, 1.0, 1.0 ] );
* var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
* var V = new Float64Array( 4 );
* var work = new Float64Array( 4 );
*
* var info = dgsvj0( 'column-major', 'no-v', 4, 3, A, 4, d, 1, sva, 1, 0, V, 4, EPS, SFMIN, TOL, 5, work, 1, 4 );
* // returns 0
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgsvj0 = require( '@stdlib/lapack/base/dgsvj0' );
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
* var d = new Float64Array( [ 1.0, 1.0, 1.0 ] );
* var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
* var V = new Float64Array( 1 );
* var work = new Float64Array( 4 );
*
* var info = dgsvj0.ndarray( 'no-v', 4, 3, A, 1, 4, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, 4 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgsvj0.ndarray" }
