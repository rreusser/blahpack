
/**
* Estimates the Skeel condition number for a general matrix.
*
* @module @stdlib/lapack/base/dla_gercond
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dlaGercond = require( '@stdlib/lapack/base/dla_gercond' );
*
* var A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
* var AF = new Float64Array( [ 2.0, 0.5, 0.0, 1.0, 2.5, 1.0, 0.0, 0.4, 3.6 ] );
* var IPIV = new Int32Array( [ 0, 1, 2 ] );
* var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
* var WORK = new Float64Array( 9 );
* var IWORK = new Int32Array( 3 );
*
* var result = dlaGercond.ndarray( 'no-transpose', 3, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_gercond.ndarray" }
