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
* Orthogonalize a complex column vector against the columns of a complex orthonormal-column matrix.
*
* ## Notes
*
* -   The projection is computed with at most two iterations of classical Gram-Schmidt with reorthogonalization, following Giraud, Langou, & Rozložník (2002). On orthonormal `Q`, the second pass is rarely required and the result is accurate to working precision.
* -   The projection coefficients are computed using the conjugate-transpose `Q^H` (rather than `Q^T`), as required for complex matrices.
* -   When the projection collapses to a norm at most `N * eps * ||X||`, `X` is truncated to zero.
* -   `zunbdb6` is used as a kernel inside the LAPACK CS Decomposition (CSD) family of routines.
*
* @module @rreusser/blahpack/lapack/base/zunbdb6
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunbdb6 from '@rreusser/blahpack/lapack/base/zunbdb6';
*
* var Q1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Q2 = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
* var X1 = new Complex128Array( [ 3.0, 4.0, 1.0, 2.0 ] );
* var X2 = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
* var WORK = new Complex128Array( 2 );
*
* zunbdb6( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunbdb6 from './zunbdb6.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunbdb6, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zunbdb6 & { ndarray: typeof ndarray }} */ ( zunbdb6 );
export { ndarray };
