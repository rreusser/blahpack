
/**
* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy.
*
* @module @stdlib/lapack/base/dlarrk
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarrk = require( '@stdlib/lapack/base/dlarrk' );
*
* var d = new Float64Array( [ 2.0, 2.0, 2.0 ] );
* var e2 = new Float64Array( [ 1.0, 1.0 ] );
* var w = new Float64Array( 1 );
* var werr = new Float64Array( 1 );
*
* var info = dlarrk( 3, 2, 0.0, 4.0, d, 1, e2, 1, 1e-18, 1e-12, w, werr );
* // info => 0
* // w[ 0 ] => ~2.0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarrk.ndarray" }
