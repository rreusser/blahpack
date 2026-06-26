
/**
* Applies a real Householder block reflector to a triangular-pentagonal matrix.
*
* @module @stdlib/lapack/base/dlarfb_gett
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarfb_gett = require( '@stdlib/lapack/base/dlarfb_gett' );
*
* var A = new Float64Array( [ 2.0, 1.0, 0.5 ] );
* var B = new Float64Array( [ 0.25, 0.5, 1.0, 3.0, 2.0, 4.0 ] );
* var T = new Float64Array( [ 1.4 ] );
* var WORK = new Float64Array( 3 );
*
* dlarfb_gett( 'column-major', 'identity', 2, 3, 1, T, 1, A, 1, B, 2, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarfb_gett.ndarray" }
