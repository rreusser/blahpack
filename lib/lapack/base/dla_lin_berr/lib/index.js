/* eslint-disable camelcase */

/**
* Compute a component-wise relative backward error.
*
* @module @stdlib/lapack/base/dla_lin_berr
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_lin_berr = require( './../lib' ); // eslint-disable-line stdlib/require-file-extensions
*
* var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6 ] );
* var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var berr = new Float64Array( 2 );
*
* dla_lin_berr( 2, 2, 2, res, 2, ayb, 2, berr );
* // berr => <Float64Array>[ 1e-6, 1e-6 ]
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_lin_berr = require( './../lib' ); // eslint-disable-line stdlib/require-file-extensions
*
* var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6 ] );
* var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var berr = new Float64Array( 2 );
*
* dla_lin_berr.ndarray( 2, 2, 2, res, 1, 2, 0, ayb, 1, 2, 0, berr, 1, 0 );
* // berr => <Float64Array>[ 1e-6, 1e-6 ]
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
