
/**
* Applies one step of incremental condition estimation for complex matrices.
*
* @module @stdlib/lapack/base/zlaic1
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zlaic1 = require( '@stdlib/lapack/base/zlaic1' );
*
* var x = new Complex128Array( [ 0.6, 0.1, 0.5, -0.2 ] );
* var w = new Complex128Array( [ 0.3, 0.4, 0.7, -0.1 ] );
* var gamma = new Complex128( 1.0, 0.5 );
* var sestpr = new Float64Array( 1 );
* var s = new Float64Array( 2 );
* var c = new Float64Array( 2 );
*
* zlaic1.ndarray( 'largest-singular-value', 2, x, 1, 0, 2.5, w, 1, 0, gamma, sestpr, s, c );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlaic1.ndarray" }
