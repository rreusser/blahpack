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
* Apply a complex triangular-pentagonal block reflector to a matrix.
*
* @module @stdlib/lapack/base/ztprfb
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztprfb = require( '@stdlib/lapack/base/ztprfb' );
*
* var V = new Complex128Array( 16 );
* var T = new Complex128Array( 9 );
* var A = new Complex128Array( 12 );
* var B = new Complex128Array( 20 );
* var W = new Complex128Array( 12 );
*
* ztprfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztprfb.ndarray" }
