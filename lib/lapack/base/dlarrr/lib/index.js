
/**
* Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy.
*
* @module @stdlib/lapack/base/dlarrr
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarrr = require( '@stdlib/lapack/base/dlarrr' );
*
* var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
* var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
*
* var info = dlarrr( 5, d, 1, e, 1 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarrr.ndarray" }
