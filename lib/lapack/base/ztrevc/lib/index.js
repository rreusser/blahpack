
/**
* Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix.
*
* @module @stdlib/lapack/base/ztrevc
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* var T = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 0.5, 3, -1, 0, 0, 0.5, -0.5, 1, 1, 4, 0.5 ] );
* var VR = new Complex128Array( 9 );
* var VL = new Complex128Array( 9 );
* var WORK = new Complex128Array( 6 );
* var RWORK = new Float64Array( 3 );
*
* var info = ztrevc( 'column-major', 'both', 'all', new Uint8Array( 3 ), 1, 3, T, 3, VL, 3, VR, 3, 3, 0, WORK, 1, RWORK, 1 );
* // ? => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztrevc.ndarray" }
