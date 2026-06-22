
/**
* Computes LQ factorization of a complex triangular-pentagonal matrix using compact WY representation (unblocked).
*
* @module @stdlib/lapack/base/ztplqt2
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztplqt2 = require( '@stdlib/lapack/base/ztplqt2' );
*
* var A = new Complex128Array( [ 2.0, 0.3, 0.5, -0.2, 0.0, 0.0, 3.0, 0.4 ] );
* var B = new Complex128Array( [ 1.0, 0.2, 0.3, 0.4, 0.5, -0.1, 1.1, -0.3 ] );
* var T = new Complex128Array( 4 );
*
* ztplqt2( 'column-major', 2, 2, 2, A, 2, B, 2, T, 2 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztplqt2.ndarray" }
