
/**
* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix.
*
* @module @stdlib/lapack/base/dhsein
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dhsein = require( '@stdlib/lapack/base/dhsein' );
*
* var N = 3;
* var H = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
* var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
* var WI = new Float64Array( N );
* var SELECT = new Uint8Array( [ 1, 1, 1 ] );
* var VL = new Float64Array( N * N );
* var VR = new Float64Array( N * N );
* var WORK = new Float64Array( ( N + 2 ) * N );
* var IFAILL = new Int32Array( N );
* var IFAILR = new Int32Array( N );
*
* var res = dhsein.ndarray( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
* // returns { info: 0, m: 3 }
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dhsein.ndarray" }
