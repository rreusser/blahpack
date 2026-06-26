
/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form.
*
* @module @stdlib/lapack/base/ztgsna
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Uint8Array = require( '@stdlib/array/uint8' );
* var Int32Array = require( '@stdlib/array/int32' );
* var ztgsna = require( '@stdlib/lapack/base/ztgsna' );
*
* var N = 1;
* var A = new Complex128Array( [ 3.0, 2.0 ] );
* var B = new Complex128Array( [ 1.0, 0.5 ] );
* var VL = new Complex128Array( [ 1.0, 0.0 ] );
* var VR = new Complex128Array( [ 1.0, 0.0 ] );
* var res = ztgsna( 'column-major', 'both', 'all', new Uint8Array( N ), 1, N, A, N, B, N, VL, N, VR, N, new Float64Array( N ), 1, new Float64Array( N ), 1, N, N, new Complex128Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0 );
* // res.m => 1
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztgsna.ndarray" }
