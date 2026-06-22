
/**
* Reconstructs the Householder vectors and block reflectors of a compact-WY TSQR factorization.
*
* @module @stdlib/lapack/base/dorhr_col
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dorhr_col = require( '@stdlib/lapack/base/dorhr_col' );
*
* var A = new Float64Array([ 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5 ]);
* var T = new Float64Array( 4 );
* var d = new Float64Array( 2 );
*
* dorhr_col( 'column-major', 4, 2, 2, A, 4, T, 2, d, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorhr_col.ndarray" }
