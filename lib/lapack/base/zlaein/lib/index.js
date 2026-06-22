
/**
* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix.
*
* @module @stdlib/lapack/base/zlaein
*
* @example
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zlaein = require( '@stdlib/lapack/base/zlaein' );
*
* var N = 3;
* var H = new Complex128Array( N * N );
* var v = new Complex128Array( N );
* var B = new Complex128Array( N * N );
* var rwork = new Float64Array( N );
* var w = new Complex128( 3.9, -0.95 );
*
* var info = zlaein( 'column-major', true, true, N, H, N, w, v, 1, B, N, rwork, 1, 1.0e-4, 1.0e-292 );
* // returns <integer>
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlaein.ndarray" }
