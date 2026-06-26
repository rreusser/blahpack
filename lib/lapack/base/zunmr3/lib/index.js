/**
* Multiplies a general matrix by the unitary matrix Q from an RZ factorization.
*
* @module @stdlib/lapack/base/zunmr3
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zunmr3 = require( '@stdlib/lapack/base/zunmr3' );
*
* var A = new Complex128Array( 6 );
* var TAU = new Complex128Array( 2 );
* var C = new Complex128Array( 9 );
* var WORK = new Complex128Array( 3 );
*
* zunmr3( 'column-major', 'left', 'no-transpose', 3, 3, 2, 0, A, 2, TAU, 1, C, 3, WORK, 1 );
* // C unchanged when all reflectors are trivial
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunmr3.ndarray" }
