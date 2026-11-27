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
* Orthogonalize a column vector against the columns of an orthonormal-column matrix; if the projection collapses, return a deterministic vector from the orthogonal complement.
*
* ## Notes
*
* -   `dorbdb5` differs from `dorbdb6` in that, when the orthogonalization collapses to zero, `dorbdb5` searches the standard basis vectors `e_1, ..., e_(m1+m2)` (X1 partition first) and returns the first one that is orthogonal to range(Q).
* -   `dorbdb5` is used as a kernel inside the LAPACK CS Decomposition (CSD) family of routines (notably `dorbdb1`-`dorbdb4`).
*
* @module @rreusser/blahpack/lapack/base/dorbdb5
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorbdb5 from '@rreusser/blahpack/lapack/base/dorbdb5';
*
* var Q1 = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var Q2 = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
* var X1 = new Float64Array( [ 3.0, 4.0 ] );
* var X2 = new Float64Array( [ 5.0, 6.0 ] );
* var WORK = new Float64Array( 2 );
*
* dorbdb5( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorbdb5.ndarray" }
