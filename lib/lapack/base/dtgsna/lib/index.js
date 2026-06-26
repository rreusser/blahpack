
/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form.
*
* @module @stdlib/lapack/base/dtgsna
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Uint8Array = require( '@stdlib/array/uint8' );
* var dtgsna = require( '@stdlib/lapack/base/dtgsna' );
*
* var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
* var VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var s = new Float64Array( 2 );
* var DIF = new Float64Array( 2 );
* var WORK = new Float64Array( 64 );
* var IWORK = new Int32Array( 16 );
* var SELECT = new Uint8Array( 2 );
* var M = new Int32Array( 1 );
*
* dtgsna.ndarray( 'both', 'all', SELECT, 1, 2, A, 2, B, 2, VL, 2, VR, 2, s, 1, DIF, 1, 2, M, WORK, 1, WORK.length, IWORK, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgsna.ndarray" }
