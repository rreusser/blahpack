
/**
* Applies an elementary reflector to a Hermitian matrix.
*
* @module @stdlib/lapack/base/zlarfy
*
* @example
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarfy = require( '@stdlib/lapack/base/zlarfy' );
*
* var C = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 1.0, 2.0, 5.0, 0.0 ] );
* var v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.25 ] );
* var WORK = new Complex128Array( 2 );
*
* zlarfy( 'column-major', 'upper', 2, v, 1, new Complex128( 1.0, 0.0 ), C, 2, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarfy.ndarray" }
