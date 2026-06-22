
/**
* Estimate reciprocal condition number of a real symmetric matrix using rook-pivoted factorization.
*
* @module @stdlib/lapack/base/dsycon_rook
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dsyconRook = require( '@stdlib/lapack/base/dsycon_rook' );
*
* var N = 3;
* var A = new Float64Array( [ 3.4, 1.0, 1.0, 0.2, 2.5, 1.0, 0.5, 0.5, 2.0 ] );
* var ipiv = new Int32Array( [ 0, 1, 2 ] );
* var work = new Float64Array( 2*N );
* var iwork = new Int32Array( N );
* var rcond = new Float64Array( 1 );
*
* dsyconRook.ndarray( 'upper', N, A, 1, N, 0, ipiv, 1, 0, 6.0, rcond, work, 1, 0, iwork, 1, 0 );
* // rcond[ 0 ] => ~0.177
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dsycon_rook.ndarray" }
