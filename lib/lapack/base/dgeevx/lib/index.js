
/**
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real nonsymmetric matrix, with optional balancing and reciprocal condition number reporting.
*
* @module @stdlib/lapack/base/dgeevx
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgeevx = require( '@stdlib/lapack/base/dgeevx' );
*
* var N = 3;
* var A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
* var WR = new Float64Array( N );
* var WI = new Float64Array( N );
* var VL = new Float64Array( N * N );
* var VR = new Float64Array( N * N );
* var SCALE = new Float64Array( N );
* var RCONDE = new Float64Array( N );
* var RCONDV = new Float64Array( N );
*
* var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, WR, 1, WI, 1, VL, N, VR, N, SCALE, RCONDE, RCONDV );
* // returns { info: 0, ilo: ..., ihi: ..., abnrm: ... }
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgeevx.ndarray" }
