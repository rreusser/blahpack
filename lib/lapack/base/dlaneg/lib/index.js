/**
* Computes the Sturm count of a symmetric tridiagonal matrix with a shift.
*
* @module @stdlib/lapack/base/dlaneg
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaneg = require( '@stdlib/lapack/base/dlaneg' );
*
* var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
* var LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
*
* var negcnt = dlaneg( 5, d, 1, LLD, 1, 0.0, 1.0e-30, 3 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaneg.ndarray" }
