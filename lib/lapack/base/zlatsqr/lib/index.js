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
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a complex `M`-by-`N` matrix (with `M >= N`).
*
* @module @stdlib/lapack/base/zlatsqr
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlatsqr = require( './../lib' );
*
* var A = new Complex128Array( [ 5.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.3, 0.0, 1.0, 0.0, 6.0, 0.0, 0.5, 0.0, 0.5, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
*
* var info = zlatsqr( 'column-major', 4, 2, 8, 2, A, 4, T, 2, WORK );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlatsqr.ndarray" }
