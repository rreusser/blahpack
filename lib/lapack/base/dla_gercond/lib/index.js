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
* Estimates the Skeel condition number for a general matrix.
*
* ## Notes
*
* -   The routine uses a dlacn2 reverse communication loop to estimate the 1-norm of the inverse of the scaled matrix, then returns the reciprocal as the condition number estimate.
* -   The `cmode` parameter controls column scaling: 1 means multiply columns of A by the corresponding entries of `c`, 0 means no scaling, -1 means divide by `c`.
* -   IPIV must contain 0-based pivot indices (as produced by dgetrf).
*
* @module @rreusser/blahpack/lapack/base/dla_gercond
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlaGercond from '@rreusser/blahpack/lapack/base/dla_gercond';
*
* var A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
* var AF = new Float64Array( [ 2.0, 0.5, 0.0, 1.0, 2.5, 1.0, 0.0, 0.4, 3.6 ] );
* var IPIV = new Int32Array( [ 0, 1, 2 ] );
* var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
* var WORK = new Float64Array( 9 );
* var IWORK = new Int32Array( 3 );
*
* var result = dlaGercond.ndarray( 'no-transpose', 3, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_gercond.ndarray" }
