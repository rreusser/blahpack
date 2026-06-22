
/**
* Computes a QL factorization of a real general matrix.
*
* @module @stdlib/lapack/base/dgeqlf
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgeqlf = require( '@stdlib/lapack/base/dgeqlf' );
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
* var TAU = new Float64Array( 3 );
* var WORK = new Float64Array( 3 );
*
* dgeqlf( 'column-major', 3, 3, A, 3, TAU, 1, WORK, 1, 3 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgeqlf = require( '@stdlib/lapack/base/dgeqlf' );
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
* var TAU = new Float64Array( 3 );
* var WORK = new Float64Array( 3 );
*
* dgeqlf.ndarray( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, 3 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgeqlf.ndarray" }
