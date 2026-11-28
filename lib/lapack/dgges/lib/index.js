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
* Computes generalized eigenvalues and real Schur form for a pair of real nonsymmetric matrices.
*
* ## Notes
*
* -   On exit, `A` is overwritten by the quasi-upper-triangular matrix S of the generalized Schur form, and `B` is overwritten by the upper-triangular matrix T.
*
* -   The generalized eigenvalues are represented as `(ALPHAR[j] + i*ALPHAI[j]) / BETA[j]`.
*
* -   When `sort` is `'sort'`, eigenvalues for which `selctg` returns `true` are reordered to the leading diagonal blocks. Complex conjugate pairs are always reordered together.
*
* -   Workspace arrays are allocated internally.
*
* @module @rreusser/blahpack/lapack/dgges
*
* @example
* import dgges from '@rreusser/blahpack/lapack/dgges';
*
* function noop() { return false; }
*
* // Upper triangular pencil (A, I): the eigenvalues are the diagonal of A.
* var A = new Float64Array( [ 1.0, 0.0, 2.0, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var sdim = new Int32Array( 1 );
* var ALPHAR = new Float64Array( 2 );
* var ALPHAI = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var VSL = new Float64Array( 4 );
* var VSR = new Float64Array( 4 );
* var WORK = new Float64Array( 32 );
* var BWORK = new Uint8Array( 2 );
*
* var info = dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, A, 2, B, 2, sdim, ALPHAR, 1, ALPHAI, 1, BETA, 1, VSL, 2, VSR, 2, WORK, BWORK );
* // returns 0
*
* // ALPHAR => <Float64Array>[ 1.0, 3.0 ]
* // ALPHAI => <Float64Array>[ 0.0, 0.0 ]
* // BETA => <Float64Array>[ 1.0, 1.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgges from './dgges.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dgges, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dgges & { strided: typeof strided }} */ ( dgges );
export { strided };
