/* eslint-disable camelcase */

/**
* Converts the factorization output format used in `zsytrf_rook` to or from the `zsytrf_rk` format for a complex symmetric matrix.
*
* @module @stdlib/lapack/base/zsyconvf_rook
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zsyconvf_rook = require( '@stdlib/lapack/base/zsyconvf_rook' );
*
* var A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 3.0, 0.5, 2.0, 0.0 ] );
* var E = new Complex128Array( 2 );
* var IPIV = new Int32Array( [ -1, -1 ] );
*
* zsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, E, 1, 0, IPIV, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsyconvf_rook.ndarray" }
