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
* Reorders the generalized real Schur decomposition of a real matrix pair.
*
* @module @stdlib/lapack/base/dtgexc
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dtgexc = require( '@stdlib/lapack/base/dtgexc' );
*
* var A = new Float64Array( [ 1.0, 0.5, 0.3, 0.0, 2.0, 0.4, 0.0, 0.0, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.2, 0.1, 0.0, 1.5, 0.3, 0.0, 0.0, 2.0 ] );
* var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var WORK = new Float64Array( 28 );
*
* var out = dtgexc( 'row-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2, WORK, 1, 28 );
* // out.info => 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgexc.ndarray" }
