
/**
* Swaps adjacent diagonal 1-by-1 blocks in an upper triangular matrix pair.
*
* @module @stdlib/lapack/base/ztgex2
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztgex2 = require( '@stdlib/lapack/base/ztgex2' );
*
* var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
* var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
*
* var info = ztgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0 );
* // info => 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztgex2.ndarray" }
