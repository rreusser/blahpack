
/**
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix.
*
* @module @stdlib/lapack/base/dlaein
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaein = require( '@stdlib/lapack/base/dlaein' );
*
* var H = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
* var B = new Float64Array( 16 );
* var WORK = new Float64Array( 3 );
* var VR = new Float64Array( 3 );
* var VI = new Float64Array( 3 );
*
* var info = dlaein( 'column-major', true, true, 3, H, 3, 3.0, 0.0, VR, 1, VI, 1, B, 4, WORK, 1, 2.2e-13, 2.22e-305, 4.49e+304 );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaein.ndarray" }
