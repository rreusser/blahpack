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
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact-WY representation produced by `zgelqt`.
*
* @module @stdlib/lapack/base/zgemlqt
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgemlqt = require( '@stdlib/lapack/base/zgemlqt' );
*
* var V = new Complex128Array( 12 );
* var T = new Complex128Array( 6 );
* var C = new Complex128Array( 16 );
* var WORK = new Complex128Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* zgemlqt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgemlqt.ndarray" }
