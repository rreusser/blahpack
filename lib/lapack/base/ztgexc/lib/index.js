
/**
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* @module @stdlib/lapack/base/ztgexc
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztgexc = require( '@stdlib/lapack/base/ztgexc' );
*
* var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
* var Q = new Complex128Array( 4 );
* var Z = new Complex128Array( 4 );
*
* var result = ztgexc.ndarray( true, true, 2, A, 1, 2, 0, B, 1, 2, 0, Q, 1, 2, 0, Z, 1, 2, 0, 0, 1 );
* // result.info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztgexc.ndarray" }
