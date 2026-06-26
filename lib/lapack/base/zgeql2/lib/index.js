
/**
* Compute a QL factorization of a complex M-by-N matrix
*
* @module @stdlib/lapack/base/zgeql2
*
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgeql2 = require( '@stdlib/lapack/base/zgeql2' );
*
* var M = 3;
* var N = 2;
* var A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 1, 5, 1, 6, 1 ] );
* var TAU = new Complex128Array( N );
* var WORK = new Complex128Array( N );
*
* zgeql2( 'column-major', M, N, A, M, TAU, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgeql2.ndarray" }
