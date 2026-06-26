
/**
* Computes some or all of the right and/or left eigenvectors of a pair of real matrices.
*
* @module @stdlib/lapack/base/dtgevc
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dtgevc = require( '@stdlib/lapack/base/dtgevc' );
*
* var N = 3;
* var S = new Float64Array( [ 1.0, 0.0, 0.0, 0.3, 2.0, 0.0, 0.2, 0.4, 3.0 ] );
* var P = new Float64Array( [ 1.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.05, 0.1, 1.0 ] );
* var VR = new Float64Array( N * N );
* var VL = new Float64Array( N * N );
* var SELECT = new Float64Array( N );
* var WORK = new Float64Array( 6 * N );
*
* var info = dtgevc( 'column-major', 'both', 'all', SELECT, 1, N, S, N, P, N, VL, N, VR, N, N, 0, WORK, 1 );
* // info => 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgevc.ndarray" }
