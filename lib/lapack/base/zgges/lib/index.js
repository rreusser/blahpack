
/**
* Computes generalized eigenvalues and Schur form for a pair of complex nonsymmetric matrices.
*
* @module @stdlib/lapack/base/zgges
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgges = require( '@stdlib/lapack/base/zgges' );
*
* function noop() { return false; }
*
* var A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var ALPHA = new Complex128Array( 2 );
* var BETA = new Complex128Array( 2 );
* var VSL = new Complex128Array( 4 );
* var VSR = new Complex128Array( 4 );
*
* var result = zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'not-sorted', noop, 2, A, 2, B, 2, ALPHA, BETA, VSL, 2, VSR, 2 );
* // result.info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgges.ndarray" }
