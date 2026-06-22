
/* eslint-disable camelcase */

/**
* Estimates the infinity norm condition number for a Hermitian indefinite matrix with inverse-c scaling.
*
* @module @stdlib/lapack/base/zla_hercond_c
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zhetrf = require( '@stdlib/lapack/base/zhetrf' );
* var zla_hercond_c = require( '@stdlib/lapack/base/zla_hercond_c' );
*
* var N = 1;
* var A = new Complex128Array( [ 5.0, 0.0 ] );
* var AF = new Complex128Array( [ 5.0, 0.0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* zhetrf( 'column-major', 'upper', N, AF, N, IPIV );
*
* var rcond = zla_hercond_c( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_hercond_c.ndarray" }
