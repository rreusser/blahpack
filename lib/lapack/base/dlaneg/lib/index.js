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
* Computes the Sturm count of a symmetric tridiagonal matrix with a shift.
*
* ## Notes
*
* -   `dlaneg` computes the Sturm count — the number of negative pivots encountered while factoring `T - sigma*I = L*D*L^T`. This count equals the number of eigenvalues of the symmetric tridiagonal matrix `T` that are strictly less than `sigma`, and is the building block of bisection-based eigenvalue algorithms (e.g., `dlarrb`).
* -   The implementation relies on IEEE-754 Inf/NaN propagation: a zero pivot is allowed to produce infinities, which the slow fallback path resolves by substituting `1` for `Inf/Inf`. The `pivmin` parameter is accepted for API compatibility but not used by the reference algorithm.
* -   `r` is the 1-based twist index: the factorization sweeps from index `1` up to `r-1` and from `N-1` down to `r`, then combines the two partial factorizations at position `r`.
*
* @module @rreusser/blahpack/lapack/base/dlaneg
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaneg from '@rreusser/blahpack/lapack/base/dlaneg';
*
* var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
* var LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
*
* var negcnt = dlaneg( 5, d, 1, LLD, 1, 0.0, 1.0e-30, 3 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaneg.ndarray" }
