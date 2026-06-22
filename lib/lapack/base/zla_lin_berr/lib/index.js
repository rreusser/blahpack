/**
* Computes a component-wise relative backward error.
*
* @module @stdlib/lapack/base/zla_lin_berr
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zlaLinBerr = require( '@stdlib/lapack/base/zla_lin_berr' );
*
* var res = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var ayb = new Float64Array( [ 1.0, 2.0 ] );
* var berr = new Float64Array( 1 );
*
* zlaLinBerr.ndarray( 2, 2, 1, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
* // berr[ 0 ] => max( (|1|+|2|)/1, (|3|+|4|)/2 ) = 3.5
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_lin_berr.ndarray" }
