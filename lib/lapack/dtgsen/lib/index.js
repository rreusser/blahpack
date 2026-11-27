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
* -   (A,B) must be in generalized real Schur canonical form (as returned by `dgges`).
*
* @module @rreusser/blahpack/lapack/dtgsen
*
* @example
* import dtgsen from '@rreusser/blahpack/lapack/dtgsen';
*
* // Diagonal pencil (A, I) with eigenvalues 1 and 2 (column-major):
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var Q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var Z = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
*
* // Select the second eigenvalue to move it to the leading position:
* var SELECT = new Uint8Array( [ 0, 1 ] );
* var ALPHAR = new Float64Array( 2 );
* var ALPHAI = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var M = new Int32Array( 1 );
* var pl = new Float64Array( 1 );
* var pr = new Float64Array( 1 );
* var DIF = new Float64Array( 2 );
* var WORK = new Float64Array( 64 );
* var IWORK = new Int32Array( 16 );
*
* var info = dtgsen( 'column-major', 1, true, true, SELECT, 1, 2, A, 2, B, 2, ALPHAR, 1, ALPHAI, 1, BETA, 1, Q, 2, Z, 2, M, pl, pr, DIF, 1, WORK, IWORK );
* // returns 0
*
* // M[ 0 ] => 1
* // ALPHAR => <Float64Array>[ 2.0, 1.0 ]
* // BETA => <Float64Array>[ 1.0, 1.0 ]
*
* // For a diagonal pencil the projections onto the deflating subspaces have unit norm:
* // pl[ 0 ] => 1.0
* // pr[ 0 ] => 1.0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgsen from './dtgsen.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgsen, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtgsen & { ndarray: typeof ndarray }} */ ( dtgsen );
export { ndarray };
