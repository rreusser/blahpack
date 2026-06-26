
/**
* Applies an elementary permutation to a complex symmetric matrix.
*
* @module @stdlib/lapack/base/zsyswapr
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zsyswapr = require( '@stdlib/lapack/base/zsyswapr' );
*
* var A = new Complex128Array( [ 1.0, 0.1, 0.0, 0.0, 0.0, 0.0, 2.0, 0.2, 4.0, 0.4, 0.0, 0.0, 3.0, 0.3, 5.0, 0.5, 6.0, 0.6 ] );
*
* zsyswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsyswapr.ndarray" }
