
/**
* Estimates the Skeel condition number for a symmetric positive-definite matrix.
*
* @module @stdlib/lapack/base/dla_porcond
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dla_porcond = require( '@stdlib/lapack/base/dla_porcond' );
*
* var A = new Float64Array( [ 4.0, 1.0, 0.5, 1.0, 5.0, 1.0, 0.5, 1.0, 6.0 ] );
* var AF = new Float64Array( [ 2.0, 0.5, 0.25, 0.5, 2.179, 0.401, 0.25, 0.401, 2.403 ] );
* var C = new Float64Array( [ 2.0, 1.0, 0.5 ] );
* var WORK = new Float64Array( 9 );
* var IWORK = new Int32Array( 3 );
*
* var result = dla_porcond.ndarray( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_porcond.ndarray" }
