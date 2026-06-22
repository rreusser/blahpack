
/**
* Computes the eigenvalues of a real matrix pair (H,T) where H is upper Hessenberg and T is upper triangular, using the QZ method.
*
* @module @stdlib/lapack/base/dhgeqz
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dhgeqz = require( '@stdlib/lapack/base/dhgeqz' );
*
* var H = new Float64Array( [ 2.0, 3.0, 1.5, 4.0 ] );
* var T = new Float64Array( [ 1.0, 0.5, 0.0, 2.0 ] );
* var ALPHAR = new Float64Array( 2 );
* var ALPHAI = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var Q = new Float64Array( 4 );
* var Z = new Float64Array( 4 );
* var WORK = new Float64Array( 10 );
*
* var info = dhgeqz( 'row-major', 'eigenvalues', 'none', 'none', 2, 1, 2, H, 2, T, 2, ALPHAR, ALPHAI, BETA, Q, 2, Z, 2 );
* // info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dhgeqz.ndarray" }
