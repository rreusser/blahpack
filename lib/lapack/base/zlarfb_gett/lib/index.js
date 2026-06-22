
/* eslint-disable camelcase */

/**
* Applies a complex Householder block reflector to a triangular-pentagonal matrix.
*
* @module @stdlib/lapack/base/zlarfb_gett
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarfb_gett = require( '@stdlib/lapack/base/zlarfb_gett' );
*
* var T = new Complex128Array( 4 );
* var A = new Complex128Array( 6 );
* var B = new Complex128Array( 9 );
* var WORK = new Complex128Array( 4 );
*
* zlarfb_gett.ndarray( 'identity', 3, 3, 2, T, 1, 2, 0, A, 1, 2, 0, B, 1, 3, 0, WORK, 1, 2, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarfb_gett.ndarray" }
