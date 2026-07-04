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
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact WY representation produced by `dgeqrt`.
*
* @module @stdlib/lapack/base/dgemqrt
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgemqrt = require( '@stdlib/lapack/base/dgemqrt' );
*
* var V = new Float64Array( 12 );
* var T = new Float64Array( 6 );
* var C = new Float64Array( 16 );
* var WORK = new Float64Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* dgemqrt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgemqrt.ndarray" }
