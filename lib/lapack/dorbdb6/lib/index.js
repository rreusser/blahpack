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
* Orthogonalize a column vector against the columns of an orthonormal-column matrix.
*
* ## Notes
*
* -   The projection is computed with at most two iterations of classical Gram-Schmidt with reorthogonalization, following Giraud, Langou, & Rozložník (2002). On orthonormal `Q`, the second pass is rarely required and the result is accurate to working precision.
* -   When the projection collapses to a norm at most `N * eps * ||X||`, `X` is truncated to zero.
* -   `dorbdb6` is used as a kernel inside the LAPACK CS Decomposition (CSD) family of routines.
*
* @module @rreusser/blahpack/lapack/dorbdb6
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorbdb6 from '@rreusser/blahpack/lapack/dorbdb6';
*
* var Q1 = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var Q2 = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
* var X1 = new Float64Array( [ 3.0, 4.0 ] );
* var X2 = new Float64Array( [ 5.0, 6.0 ] );
* var WORK = new Float64Array( 2 );
*
* dorbdb6( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb6 from './dorbdb6.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorbdb6, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorbdb6 & { ndarray: typeof ndarray }} */ ( dorbdb6 );
export { ndarray };
