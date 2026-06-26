
/**
* Estimates the Skeel condition number for a general banded matrix.
*
* @module @stdlib/lapack/base/dla_gbrcond
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );
* var dla_gbrcond = require( '@stdlib/lapack/base/dla_gbrcond' );
*
* var AB = new Float64Array( [ 0.0, 2.0, 1.0, 3.0, 5.0, 4.0, 6.0, 8.0, 0.0 ] );
* var AFB = new Float64Array( [ 0.0, 0.0, 2.0, 1.0, 0.0, 3.0, 5.0, 4.0, 0.0, 6.0, 8.0, 0.0 ] );
* var IPIV = new Int32Array( 3 );
* var c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var WORK = new Float64Array( 15 );
* var IWORK = new Int32Array( 3 );
*
* dgbtrf( 'row-major', 3, 3, 1, 1, AFB, 4 );
* var result = dla_gbrcond.ndarray( 'no-transpose', 3, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 )
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_gbrcond.ndarray" }
