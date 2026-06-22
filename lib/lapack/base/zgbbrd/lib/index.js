
/**
* Reduces a complex general band matrix to real upper bidiagonal form.
*
* @module @stdlib/lapack/base/zgbbrd
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zgbbrd = require( '@stdlib/lapack/base/zgbbrd' );
*
* var AB = new Complex128Array( [ 0,0, 2,0, -1,0,  -1,0, 3,0, -1,0,  -1,0, 4,0, 0,0 ] );
* var d = new Float64Array( 3 );
* var e = new Float64Array( 2 );
* var Q = new Complex128Array( 1 );
* var PT = new Complex128Array( 1 );
* var C = new Complex128Array( 1 );
* var WORK = new Complex128Array( 6 );
* var RWORK = new Float64Array( 6 );
*
* zgbbrd( 'column-major', 'no-vectors', 3, 3, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1, RWORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgbbrd.ndarray" }
