
/**
* Multiplies a general matrix by the orthogonal matrix Q from an RZ factorization.
*
* @module @stdlib/lapack/base/dormr3
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dormr3 = require( '@stdlib/lapack/base/dormr3' );
*
* var A = new Float64Array( 6 );
* var TAU = new Float64Array( 2 );
* var C = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
* var WORK = new Float64Array( 3 );
*
* dormr3( 'column-major', 'left', 'no-transpose', 3, 3, 2, 0, A, 2, TAU, 1, C, 3, WORK, 1 );
* // C unchanged when all reflectors are trivial
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dormr3.ndarray" }
