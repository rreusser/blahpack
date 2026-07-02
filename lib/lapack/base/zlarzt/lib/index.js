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
* Forms the triangular factor T of a complex block reflector.
*
* @module @stdlib/lapack/base/zlarzt
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarzt = require( '@stdlib/lapack/base/zlarzt' );
*
* var K = 1;
* var N = 3;
* var V = new Complex128Array( [ 0.3, 0.1, -0.5, 0.2, 0.0, 0.0 ] );
* var TAU = new Complex128Array( [ 0.8, -0.3 ] );
* var T = new Complex128Array( K * K );
*
* zlarzt.ndarray( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarzt.ndarray" }
