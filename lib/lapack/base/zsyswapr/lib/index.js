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
* Applies an elementary permutation to a complex symmetric matrix.
*
* ## Notes
*
* -   `zsyswapr` is used internally by the Bunch-Kaufman factorization routines (e.g., `zsytrf_rook`) to apply pivot interchanges to a complex symmetric matrix while preserving the upper- or lower-triangular storage layout.
* -   The matrix is complex *symmetric* (not Hermitian): diagonal and off-diagonal elements may have non-zero imaginary parts, and mirror elements are equal without conjugation.
* -   Indices `i1` and `i2` are zero-based and must satisfy `0 <= i1 <= i2 < N`. When `i1 === i2`, the call is a no-op.
*
* @module @rreusser/blahpack/lapack/base/zsyswapr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zsyswapr from '@rreusser/blahpack/lapack/base/zsyswapr';
*
* var A = new Complex128Array( [ 1.0, 0.1, 0.0, 0.0, 0.0, 0.0, 2.0, 0.2, 4.0, 0.4, 0.0, 0.0, 3.0, 0.3, 5.0, 0.5, 6.0, 0.6 ] );
*
* zsyswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsyswapr.ndarray" }
