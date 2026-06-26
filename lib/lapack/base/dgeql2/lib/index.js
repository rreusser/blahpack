
/**
* Compute a QL factorization of a real M-by-N matrix
*
* @module @stdlib/lapack/base/dgeql2
*
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgeql2 = require( '@stdlib/lapack/base/dgeql2' );
*
* var M = 3;
* var N = 3;
* var A = discreteUniform( M * N, -10, 10, opts );
* var TAU = new Float64Array( Math.min( M, N ) );
* var WORK = new Float64Array( N );
*
* dgeql2( 'column-major', M, N, A, M, TAU, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgeql2.ndarray" }
