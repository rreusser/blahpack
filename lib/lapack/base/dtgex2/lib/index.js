
/**
* Swaps adjacent diagonal 1-by-1 or 2-by-2 blocks in an upper (quasi) triangular matrix pair.
*
* @module @stdlib/lapack/base/dtgex2
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dtgex2 = require( './main.js' );
*
* var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
* var Q = new Float64Array( [ 1, 0, 0, 1 ] );
* var Z = new Float64Array( [ 1, 0, 0, 1 ] );
* var WORK = new Float64Array( 20 );
*
* var info = dtgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0, 1, 1, WORK, 1, 20 );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgex2.ndarray" }
