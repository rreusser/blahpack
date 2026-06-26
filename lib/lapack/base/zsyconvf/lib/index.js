
/**
* Converts the factorization output format used in zsytrf for complex symmetric matrices.
*
* @module @stdlib/lapack/base/zsyconvf
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zsyconvf = require( '@stdlib/lapack/base/zsyconvf' );
*
* var A = new Complex128Array( 4 );
* var E = new Complex128Array( 2 );
* var IPIV = new Int32Array( [ 0, 1 ] );
*
* zsyconvf( 'column-major', 'upper', 'convert', 2, A, 2, E, 1, IPIV, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsyconvf.ndarray" }
