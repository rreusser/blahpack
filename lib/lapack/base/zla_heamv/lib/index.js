/* eslint-disable camelcase */

/**
* Computes a matrix-vector product using a Hermitian indefinite matrix to calculate error bounds.
*
* @module @stdlib/lapack/base/zla_heamv
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zla_heamv = require( '@stdlib/lapack/base/zla_heamv' );
*
* var A = new Complex128Array( [ 2.0, 0.0, 1.0, 2.0, 1.0, -2.0, 5.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.5, -2.0, 1.0 ] );
* var y = new Float64Array( 2 );
*
* zla_heamv( 'column-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_heamv.ndarray" }
