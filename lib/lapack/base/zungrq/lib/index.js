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
* Generates an M-by-N complex matrix Q with orthonormal rows, defined as the last M rows of a product of K elementary reflectors of order N.
*
* @module @stdlib/lapack/base/zungrq
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgerqf = require( '@stdlib/lapack/base/zgerqf' );
* var zungrq = require( '@stdlib/lapack/base/zungrq' );
*
* var A = new Complex128Array( [ 1.0, 0.5, 2.0, -0.3, 3.0, 0.2, 4.0, 0.6 ] );
* var TAU = new Complex128Array( 1 );
* var WORK = new Complex128Array( 32 );
*
* zgerqf.ndarray( 1, 4, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
* var info = zungrq.ndarray( 1, 4, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zungrq.ndarray" }
