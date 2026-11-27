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
* Applies one step of incremental condition estimation.
*
* ## Notes
*
* -   The routine computes `sestpr`, `s`, and `c` such that the vector `xhat = [ s*x; c ]` is an approximate singular vector of the extended matrix `Lhat = [ L, 0; w^T, gamma ]`.
* -   When `job` is `'largest-singular-value'`, an estimate for the largest singular value is computed. When `job` is `'smallest-singular-value'`, an estimate for the smallest singular value is computed.
*
* @module @rreusser/blahpack/lapack/base/dlaic1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaic1 from '@rreusser/blahpack/lapack/base/dlaic1';
*
* var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
* var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var sestpr = new Float64Array( 1 );
* var s = new Float64Array( 1 );
* var c = new Float64Array( 1 );
*
* dlaic1( 'largest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, sestpr, s, c );
* // sestpr[ 0 ] => ~5.5289
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaic1.ndarray" }
