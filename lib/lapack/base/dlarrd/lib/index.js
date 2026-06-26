
/**
* Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy
*
* @module @stdlib/lapack/base/dlarrd
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dlarrd = require( '@stdlib/lapack/base/dlarrd' );
*
* var N = 4;
* var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5 ] );
* var e = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
* var E2 = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
* var GERS = new Float64Array( [ 1.0, 3.0, -3.0, 1.0, 1.0, 5.0, -0.5, 1.5 ] );
* var ISPLIT = new Int32Array( [ N ] );
* var w = new Float64Array( N );
* var WERR = new Float64Array( N );
* var IBLOCK = new Int32Array( N );
* var INDEXW = new Int32Array( N );
*
* dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 8.881784197001252e-16, d, 1, e, 1, E2, 1, 2.2250738585072014e-308, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
* // w => <Float64Array>[ ~-1.531, ~0.203, ~2.250, ~3.578 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarrd.ndarray" }
