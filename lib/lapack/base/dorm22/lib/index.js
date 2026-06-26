
/**
* Multiplies a general matrix by a banded orthogonal matrix.
*
* @module @stdlib/lapack/base/dorm22
*
* @example
* var uniform = require( '@stdlib/random/array/uniform' );
* var dorm22 = require( '@stdlib/lapack/base/dorm22' );
*
* var Q = uniform( 25, -1.0, 1.0, { 'dtype': 'float64' } );
* var C = uniform( 20, -1.0, 1.0, { 'dtype': 'float64' } );
* var WORK = uniform( 20, 0.0, 1.0, { 'dtype': 'float64' } );
*
* dorm22( 'column-major', 'left', 'no-transpose', 5, 4, 3, 2, Q, 5, C, 5, WORK, 1, 20 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorm22.ndarray" }
