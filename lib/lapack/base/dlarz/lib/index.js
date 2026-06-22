
/**
* Applies an elementary reflector from RZ factorization to a general matrix.
*
* @module @stdlib/lapack/base/dlarz
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarz = require( '@stdlib/lapack/base/dlarz' );
*
* var v = new Float64Array( [ 0.5, 0.25 ] );
* var C = new Float64Array( [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ] );
* var WORK = new Float64Array( 4 );
*
* dlarz( 'column-major', 'left', 4, 4, 2, v, 1, 1.5, C, 4, WORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarz.ndarray" }
