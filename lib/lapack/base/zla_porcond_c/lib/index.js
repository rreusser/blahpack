
/* eslint-disable camelcase */

/**
* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with inverse-c scaling.
*
* @module @stdlib/lapack/base/zla_porcond_c
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zpotrf = require( '@stdlib/lapack/base/zpotrf' );
* var zla_porcond_c = require( '@stdlib/lapack/base/zla_porcond_c' );
*
* var N = 1;
* var A = new Complex128Array( [ 4.0, 0.0 ] );
* var AF = new Complex128Array( [ 4.0, 0.0 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* zpotrf( 'column-major', 'upper', N, AF, N );
*
* var rcond = zla_porcond_c( 'column-major', 'upper', N, A, N, AF, N, c, 1, true, WORK, 1, RWORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_porcond_c.ndarray" }
