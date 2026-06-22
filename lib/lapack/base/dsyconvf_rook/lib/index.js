
/* eslint-disable camelcase */

/**
* Converts the factorization output format used in dsytrf_rook.
*
* @module @stdlib/lapack/base/dsyconvf_rook
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dsyconvf_rook = require( '@stdlib/lapack/base/dsyconvf_rook' );
*
* var A = new Float64Array( [ 1.0, 0.0, 3.0, 2.0 ] );
* var e = new Float64Array( 2 );
* var IPIV = new Int32Array( [ -1, -2 ] );
*
* dsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, e, 1, 0, IPIV, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dsyconvf_rook.ndarray" }
