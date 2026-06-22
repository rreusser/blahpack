
/**
* Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling.
*
* @module @stdlib/lapack/base/zla_gbrcond_c
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zla_gbrcond_c = require( '@stdlib/lapack/base/zla_gbrcond_c' );
*
* var AB = new Complex128Array( [ 0, 0, 5, 0, 0, 0 ] );
* var AFB = new Complex128Array( [ 0, 0, 0, 0, 5, 0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* var rcond = zla_gbrcond_c.ndarray( 'no-transpose', 1, 0, 0, AB, 1, 1, 1, AFB, 1, 1, 2, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_gbrcond_c.ndarray" }
