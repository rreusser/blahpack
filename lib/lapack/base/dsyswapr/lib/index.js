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
* Applies an elementary permutation to a symmetric matrix.
*
* ## Notes
*
* -   `dsyswapr` is used internally by the Bunch-Kaufman factorization routines (e.g., `dsytrf_rook`) to apply pivot interchanges to a symmetric matrix while preserving the upper- or lower-triangular storage layout.
* -   Indices `i1` and `i2` are zero-based and must satisfy `0 <= i1 <= i2 < N`. When `i1 === i2`, the call is a no-op.
*
* @module @rreusser/blahpack/lapack/base/dsyswapr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dsyswapr from '@rreusser/blahpack/lapack/base/dsyswapr';
*
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
*
* dsyswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dsyswapr.ndarray" }
