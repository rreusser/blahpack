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
* Orthogonalize a complex column vector against the columns of an orthonormal-column matrix; if the projection collapses, return a deterministic vector from the orthogonal complement.
*
* ## Notes
*
* -   `zunbdb5` is the complex analog of `dorbdb5`. The projection step uses the conjugate-transpose `Q^H` (rather than `Q^T`).
* -   When the orthogonalization collapses to zero, `zunbdb5` searches the standard basis vectors `e_1, ..., e_(m1+m2)` (X1 partition first) and returns the first one whose projection onto the orthogonal complement of `Q` is nonzero.
* -   `zunbdb5` is used as a kernel inside the LAPACK CS Decomposition (CSD) family of routines (notably `zunbdb1`-`zunbdb4`).
*
* @module @rreusser/blahpack/lapack/zunbdb5
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunbdb5 from '@rreusser/blahpack/lapack/zunbdb5';
*
* var Q1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Q2 = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
* var X1 = new Complex128Array( [ 3.0, 0.0, 4.0, 0.0 ] );
* var X2 = new Complex128Array( [ 5.0, 0.0, 6.0, 0.0 ] );
* var WORK = new Complex128Array( 2 );
*
* zunbdb5( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunbdb5 from './zunbdb5.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zunbdb5, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zunbdb5 & { strided: typeof strided }} */ ( zunbdb5 );
export { strided };
