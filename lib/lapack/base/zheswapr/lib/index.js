
/**
* Applies an elementary permutation to a complex Hermitian matrix.
*
* @module @stdlib/lapack/base/zheswapr
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zheswapr = require( '@stdlib/lapack/base/zheswapr' );
*
* var A = new Complex128Array( [ 1, 0, 2, 1, 3, 2, 2, -1, 4, 0, 5, 1, 3, -2, 5, -1, 6, 0 ] );
* zheswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zheswapr.ndarray" }
