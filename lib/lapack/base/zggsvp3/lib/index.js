
/**
* Computes unitary matrices for generalized SVD pre-processing of a complex matrix pair.
*
* @module @stdlib/lapack/base/zggsvp3
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zggsvp3 = require( '@stdlib/lapack/base/zggsvp3' );
*
* var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
* var B = new Complex128Array( [ 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
* var U = new Complex128Array( 4 );
* var V = new Complex128Array( 4 );
* var Q = new Complex128Array( 4 );
* var IWORK = new Int32Array( 2 );
* var RWORK = new Float64Array( 4 );
* var TAU = new Complex128Array( 2 );
* var WORK = new Complex128Array( 100 );
* var K = [ 0 ];
* var L = [ 0 ];
*
* zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 100 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zggsvp3.ndarray" }
