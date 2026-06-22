
/**
* Estimates the infinity norm condition number for a complex symmetric indefinite matrix with x scaling.
*
* @module @stdlib/lapack/base/zla_syrcond_x
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zla_syrcond_x = require( '@stdlib/lapack/base/zla_syrcond_x' );
*
* var A = new Complex128Array( [ 2, 0, 1, 0, 0, 0, 3, 0 ] );
* var AF = new Complex128Array( A );
* var IPIV = new Int32Array( [ 0, 1 ] );
* var X = new Complex128Array( [ 1, 0, 1, 0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* var rcond = zla_syrcond_x( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_syrcond_x.ndarray" }
