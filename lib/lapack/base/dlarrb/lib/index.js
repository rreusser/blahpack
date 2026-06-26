
/**
* Provides limited bisection to locate eigenvalues of a symmetric tridiagonal matrix for more accuracy.
*
* @module @stdlib/lapack/base/dlarrb
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dlarrb = require( '@stdlib/lapack/base/dlarrb' );
*
* var d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
* var LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
* var w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
* var WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
* var WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );
* var WORK = new Float64Array( 8 );
* var IWORK = new Int32Array( 8 );
*
* dlarrb( 4, d, 1, LLD, 1, 1, 4, 1.0e-8, 1.0e-14, 0, w, 1, WGAP, 1, WERR, 1, WORK, 1, IWORK, 1, 0, 2.2e-308, 6.0, -1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarrb.ndarray" }
