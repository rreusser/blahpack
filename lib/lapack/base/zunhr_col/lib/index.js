

/**
* Reconstructs Householder reflector vectors and block reflector triangular factors from a unitary-on-input matrix.
*
* @module @stdlib/lapack/base/zunhr_col
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zunhr_col = require( '@stdlib/lapack/base/zunhr_col' );
*
* var M = 3;
* var N = 3;
* var nb = 1;
* var A = new Complex128Array( M * N );
* var T = new Complex128Array( M * N );
* var d = new Float64Array( N );
*
* zunhr_col( 'column-major', M, N, nb, A, M, T, M, d, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunhr_col.ndarray" }
