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
* Compute a blocked LQ factorization of a complex M-by-N matrix A using the compact WY representation of Q.
*
* @module @stdlib/lapack/base/zgelqt
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgelqt = require( '@stdlib/lapack/base/zgelqt' );
*
* var A = new Complex128Array( [ 3.0, 0.0, 0.5, 0.0, 0.6, 0.0, 4.0, 0.0, 0.4, 0.0, 0.7, 0.0, 0.2, 0.0, 0.3, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 8 );
*
* zgelqt( 'column-major', 2, 4, 2, A, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgelqt.ndarray" }
