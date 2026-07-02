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
* Orthogonalize a complex column vector against the columns of a complex orthonormal-column matrix.
*
* @module @stdlib/lapack/base/zunbdb6
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zunbdb6 = require( '@stdlib/lapack/base/zunbdb6' );
*
* var Q1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Q2 = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
* var X1 = new Complex128Array( [ 3.0, 4.0, 1.0, 2.0 ] );
* var X2 = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
* var WORK = new Complex128Array( 2 );
*
* zunbdb6( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunbdb6.ndarray" }
