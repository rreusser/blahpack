
/**
* Computes generalized eigenvalues and real Schur form for a pair of real nonsymmetric matrices.
*
* @module @stdlib/lapack/base/dgges
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgges = require( '@stdlib/lapack/base/dgges' );
*
* function noop() { return false; }
*
* var A = new Float64Array( [ 1, 0, 0, 2 ] );
* var B = new Float64Array( [ 1, 0, 0, 1 ] );
* var ALPHAR = new Float64Array( 2 );
* var ALPHAI = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var VSL = new Float64Array( 4 );
* var VSR = new Float64Array( 4 );
*
* var result = dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'not-sorted', noop, 2, A, 2, B, 2, ALPHAR, ALPHAI, BETA, VSL, 2, VSR, 2 );
* // result.info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgges.ndarray" }
