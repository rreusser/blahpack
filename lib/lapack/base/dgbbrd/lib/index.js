
/**
* Reduces a real general band matrix to upper bidiagonal form.
*
* @module @stdlib/lapack/base/dgbbrd
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgbbrd = require( '@stdlib/lapack/base/dgbbrd' );
*
* var AB = new Float64Array([
*     0.0, 4.0, -1.0,
*     -1.0, 4.0, -1.0,
*     -1.0, 4.0, -1.0,
*     -1.0, 4.0, -1.0,
*     -1.0, 4.0, 0.0
* ]);
* var d = new Float64Array( 5 );
* var e = new Float64Array( 4 );
* var Q = new Float64Array( 1 );
* var PT = new Float64Array( 1 );
* var C = new Float64Array( 1 );
* var WORK = new Float64Array( 10 );
*
* dgbbrd( 'column-major', 'no-vectors', 5, 5, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgbbrd.ndarray" }
