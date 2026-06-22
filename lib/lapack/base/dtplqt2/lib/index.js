
/**
* Computes LQ factorization of a triangular-pentagonal matrix using compact WY representation (unblocked).
*
* @module @stdlib/lapack/base/dtplqt2
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dtplqt2 = require( '@stdlib/lapack/base/dtplqt2' );
*
* var A = new Float64Array( [ 2.0, 0.5, 0.0, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
* var T = new Float64Array( 4 );
*
* dtplqt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtplqt2.ndarray" }
