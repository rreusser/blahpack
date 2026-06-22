
/**
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* @module @stdlib/lapack/base/ztgsen
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Uint8Array = require( '@stdlib/array/uint8' );
* var ztgsen = require( '@stdlib/lapack/base/ztgsen' );
*
* var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, -0.1, 1.0, 0.0 ] );
* var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var SELECT = new Uint8Array( [ 1, 0, 1 ] );
* var ALPHA = new Complex128Array( 3 );
* var BETA = new Complex128Array( 3 );
* var DIF = new Float64Array( 2 );
* var WORK = new Complex128Array( 64 );
* var IWORK = new Int32Array( 64 );
*
* var r = ztgsen( 'column-major', 0, true, true, SELECT, 1, 3, A, 3, B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WORK, 1, -1, IWORK, 1, 0, -1 );
* // returns { 'info': 0, 'm': 2, 'pl': 1.0, 'pr': 1.0 }
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztgsen.ndarray" }
