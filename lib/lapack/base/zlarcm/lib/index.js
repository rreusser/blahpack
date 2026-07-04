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
* Performs the matrix-matrix multiplication `C = A * B`, where `A` is an `M`-by-`M` real matrix and `B` is an `M`-by-`N` complex matrix.
*
* @module @stdlib/lapack/base/zlarcm
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zlarcm = require( '@stdlib/lapack/base/zlarcm' );
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, -1.0, 1.0 ] );
* var C = new Complex128Array( 4 );
* var RWORK = new Float64Array( 8 );
*
* zlarcm( 'column-major', 2, 2, A, 2, B, 2, C, 2, RWORK );
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zlarcm = require( '@stdlib/lapack/base/zlarcm' );
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, -1.0, 1.0 ] );
* var C = new Complex128Array( 4 );
* var RWORK = new Float64Array( 8 );
*
* zlarcm.ndarray( 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, RWORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarcm.ndarray" }
