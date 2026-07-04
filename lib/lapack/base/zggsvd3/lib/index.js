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
* Computes the generalized singular value decomposition of a complex matrix pair.
*
* @module @stdlib/lapack/base/zggsvd3
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zggsvd3 = require( '@stdlib/lapack/base/zggsvd3' );
*
* var A = new Complex128Array( 9 );
* var B = new Complex128Array( 6 );
* // Populate A and B, then invoke zggsvd3 with the required workspaces...
* var K = new Int32Array( 1 );
* // info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, K, L, A, 3, B, 2, ... );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zggsvd3.ndarray" }
