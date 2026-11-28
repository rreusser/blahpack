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
* Finds a new relatively robust representation for a tridiagonal cluster.
*
* ## Notes
*
* -   This is an auxiliary routine used within the MRRR eigenvalue algorithm. Given a parent `LDL^T` factorization of a symmetric tridiagonal matrix and a set of approximate eigenvalues forming a tight cluster, it selects a shift `sigma` and computes a new factorization `L(+) D(+) L(+)^T = L D L^T - sigma*I` such that at least one eigenvalue of the shifted matrix is relatively isolated.
* -   Two candidate shifts derived from the outer bounds of the cluster are tested, each followed by a growth-bounded differential-stationary `qd` factorization; the first to satisfy the growth heuristic is chosen.
* -   `pivmin` should be a safe pivot threshold such as a small multiple of the smallest normal double-precision number.
*
* @module @rreusser/blahpack/lapack/dlarrf
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlarrf from '@rreusser/blahpack/lapack/dlarrf';
*
* var N = 4;
* var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
* var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
* var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
* var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
* var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
* var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
* var sigma = new Float64Array( 1 );
* var dplus = new Float64Array( N );
* var lplus = new Float64Array( N );
* var work = new Float64Array( 2 * N );
*
* dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, 2.2250738585072014e-308, sigma, dplus, 1, lplus, 1, work, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrf from './dlarrf.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dlarrf, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dlarrf & { strided: typeof strided }} */ ( dlarrf );
export { strided };
