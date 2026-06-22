
/**
* Reorders the generalized real Schur decomposition of a real matrix pair.
*
* @module @stdlib/lapack/base/dtgsen
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Uint8Array = require( '@stdlib/array/uint8' );
* var dtgsen = require( '@stdlib/lapack/base/dtgsen' );
*
* var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
* var Q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var Z = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var SELECT = new Uint8Array( [ 0, 1 ] );
* var ALPHAR = new Float64Array( 2 );
* var ALPHAI = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var M = new Int32Array( 1 );
* var pl = new Float64Array( 1 );
* var pr = new Float64Array( 1 );
* var DIF = new Float64Array( 2 );
* var WORK = new Float64Array( 100 );
* var IWORK = new Int32Array( 100 );
*
* var info = dtgsen( 0, true, true, SELECT, 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, 2, 0, Z, 1, 2, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 100, IWORK, 1, 0, 100 );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgsen.ndarray" }
