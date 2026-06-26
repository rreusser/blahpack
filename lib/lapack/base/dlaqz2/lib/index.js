
/**
* Chases a 2-by-2 shift bulge in a matrix pencil `(A,B)` down a single position.
*
* @module @stdlib/lapack/base/dlaqz2
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaqz2 = require( '@stdlib/lapack/base/dlaqz2' );
*
* var A = new Float64Array( [ 1.2, 0.9, 0.4, 0.8, 1.5, 0.3, 0.5, 0.6, 1.8 ] );
* var B = new Float64Array( [ 2.1, 0.5, 0.7, 0.0, 2.3, 0.4, 0.0, 0.0, 2.5 ] );
* var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
* var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
*
* dlaqz2( 'column-major', true, true, 0, 0, 2, 2, A, 3, B, 3, 3, 0, Q, 3, 3, 0, Z, 3 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaqz2.ndarray" }
