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
* Computes a blocked Tall-Skinny LQ (TSLQ) factorization of a real `M`-by-`N` matrix (with `M <= N`).
*
* @module @stdlib/lapack/base/dlaswlq
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaswlq = require( './../lib' );
*
* var A = new Float64Array( [ 5.0, 1.0, 0.5, 0.3, 1.0, 6.0, 0.5, 0.5 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* var info = dlaswlq( 'column-major', 2, 4, 2, 8, A, 2, T, 2, WORK );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaswlq.ndarray" }
