
/**
* Generate an M-by-N real matrix Q with orthonormal rows from an RQ factorization
*
* @module @stdlib/lapack/base/dorgr2
*
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dorgr2 = require( '@stdlib/lapack/base/dorgr2' );
*
* var M = 3;
* var N = 5;
* var K = 3;
* var TAU = new Float64Array( Math.min( M, N ) );
* var WORK = new Float64Array( M );
*
* dorgr2( 'column-major', M, N, K, A, M, TAU, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorgr2.ndarray" }
