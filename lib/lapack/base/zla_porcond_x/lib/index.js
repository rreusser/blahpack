
/**
* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with x scaling.
*
* @module @stdlib/lapack/base/zla_porcond_x
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zla_porcond_x = require( '@stdlib/lapack/base/zla_porcond_x' );
*
* var A = new Complex128Array( [ 4, 0, 0, 0, 0, 0, 5, 0 ] );
* var AF = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 2.2360679774997896, 0 ] );
* var X = new Complex128Array( [ 1, 0, 1, 0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* var rcond = zla_porcond_x( 'column-major', 'upper', 2, A, 2, AF, 2, X, 1, WORK, 1, RWORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_porcond_x.ndarray" }
