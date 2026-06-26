
/**
* Multiplies a general matrix by a unitary matrix.
*
* @module @stdlib/lapack/base/zunm22
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zunm22 = require( '@stdlib/lapack/base/zunm22' );
*
* var Q = new Complex128Array( 25 );
* var C = new Complex128Array( 20 );
* var WORK = new Complex128Array( 20 );
*
* zunm22( 'column-major', 'left', 'no-transpose', 5, 4, 3, 2, Q, 5, C, 5, WORK, 1, 20 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunm22.ndarray" }
