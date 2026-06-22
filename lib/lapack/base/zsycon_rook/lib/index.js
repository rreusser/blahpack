/**
* Estimate reciprocal condition number of a complex symmetric matrix using rook-pivoted factorization.
*
* @module @stdlib/lapack/base/zsycon_rook
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zsyconRook = require( '@stdlib/lapack/base/zsycon_rook' );
*
* var N = 3;
* var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] );
* var ipiv = new Int32Array( [ 0, 1, 2 ] );
* var work = new Complex128Array( 2*N );
* var rcond = new Float64Array( 1 );
*
* zsyconRook.ndarray( 'upper', N, A, 1, N, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0 );
* // rcond[ 0 ] => 1
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsycon_rook.ndarray" }
