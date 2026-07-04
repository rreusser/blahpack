/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Converts a double-complex triangular matrix to a single-complex triangular matrix with overflow checking.
*
* @module @stdlib/lapack/base/zlat2c
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex64Array = require( '@stdlib/array/complex64' );
* var zlat2c = require( '@stdlib/lapack/base/zlat2c' );
*
* var A = new Complex128Array( 4 );
* A.set( [ 1.0, 2.0 ], 0 );
* A.set( [ 3.0, 4.0 ], 2 );
* A.set( [ 5.0, 6.0 ], 3 );
*
* var SA = new Complex64Array( 4 );
* var info = zlat2c( 'column-major', 'upper', 2, A, 2, SA, 2 );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlat2c.ndarray" }
