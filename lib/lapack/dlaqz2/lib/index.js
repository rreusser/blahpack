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
* Chases a 2-by-2 shift bulge in a matrix pencil `(A,B)` down a single position.
*
* ## Notes
*
* -   On entry, the 2-by-2 bulge is located in the sub-block `(A[k+1:k+3, k:k+2], B[k+1:k+3, k:k+2])`. On exit, the bulge has been chased one position further down the pencil.
* -   Updates to `(A,B)` are restricted to rows `istartm:k+4` and columns `k:istopm+1`. It is assumed without checking that `istartm <= k+1` and `k+2 <= istopm`.
* -   When `k+2 == ihi`, the bulge is at the edge of the active range and is removed instead of chased.
*
* @module @rreusser/blahpack/lapack/base/dlaqz2
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaqz2 from '@rreusser/blahpack/lapack/base/dlaqz2';
*
* var A = new Float64Array( [ 1.2, 0.9, 0.4, 0.8, 1.5, 0.3, 0.5, 0.6, 1.8 ] );
* var B = new Float64Array( [ 2.1, 0.5, 0.7, 0.0, 2.3, 0.4, 0.0, 0.0, 2.5 ] );
* var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
* var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
*
* dlaqz2( 'column-major', true, true, 0, 0, 2, 2, A, 3, B, 3, 3, 0, Q, 3, 3, 0, Z, 3 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqz2 from './dlaqz2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqz2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaqz2 & { ndarray: typeof ndarray }} */ ( dlaqz2 );
export { ndarray };
