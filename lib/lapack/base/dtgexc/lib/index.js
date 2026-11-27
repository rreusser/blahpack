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
* Reorders the generalized real Schur decomposition of a real matrix pair.
*
* ## Notes
*
* -   The routine moves a diagonal block of the generalized real Schur form from position `ifst` to position `ilst`. Both `ifst` and `ilst` are 0-based indices and may be adjusted on return if they point to the second row of a 2-by-2 block.
* -   The workspace array `WORK` should have length at least `4*N + 16`.
*
* @module @rreusser/blahpack/lapack/base/dtgexc
*
* @example
* import dtgexc from '@rreusser/blahpack/lapack/base/dtgexc';
*
* // Upper triangular pencil (A, I) with eigenvalues 1, 2, 3 (column-major):
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var WORK = new Float64Array( 28 );
*
* // Move the eigenvalue at row 0 to row 2 (0-based):
* var ifst = new Int32Array( [ 0 ] );
* var ilst = new Int32Array( [ 2 ] );
*
* var info = dtgexc( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, ifst, ilst, WORK );
* // returns 0
*
* // ilst[ 0 ] => 2
*
* // The eigenvalues A(i,i)/B(i,i) are now ordered 2, 3, 1:
* // A[ 0 ] => -2.0
* // A[ 4 ] => ~3.0
* // A[ 8 ] => -1.0
* // B[ 0 ] => -1.0
* // B[ 4 ] => 1.0
* // B[ 8 ] => -1.0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgexc from './dtgexc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgexc, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtgexc & { ndarray: typeof ndarray }} */ ( dtgexc );
export { ndarray };
