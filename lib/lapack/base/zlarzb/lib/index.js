
/**
* Applies a complex block reflector from RZ factorization to a general matrix.
*
* @module @stdlib/lapack/base/zlarzb
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarzb = require( '@stdlib/lapack/base/zlarzb' );
*
* var V = new Complex128Array( [ 0.2, 0.1, 0.4, -0.3, -0.1, 0.3, 0.5, 0.2 ] );
* var T = new Complex128Array( [ 0.7, 0.1, 0.3, -0.2, 0.0, 0.0, 0.5, 0.3 ] );
* var C = new Complex128Array( 4 * 3 );
* var WORK = new Complex128Array( 3 * 2 );
*
* zlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 4, 3, 2, 2, V, 2, T, 2, C, 4, WORK, 3 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarzb.ndarray" }
