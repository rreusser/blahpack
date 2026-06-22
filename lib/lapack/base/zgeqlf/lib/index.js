
/**
* Computes a QL factorization of a complex general matrix.
*
* @module @stdlib/lapack/base/zgeqlf
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgeqlf = require( '@stdlib/lapack/base/zgeqlf' );
*
* var A = new Complex128Array( [ 1.0, 0.5, 2.0, 1.0, 3.0, 1.5, 4.0, 2.0, 0.5, 1.0, 1.0, 0.5, 1.5, 1.0, 2.0, 1.5, 1.0, 0.0, 2.0, 0.5, 3.0, 1.0, 4.0, 1.5 ] );
* var TAU = new Complex128Array( 3 );
* var WORK = new Complex128Array( 256 );
*
* zgeqlf( 'column-major', 4, 3, A, 4, TAU, 1, WORK, 1, -1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgeqlf.ndarray" }
