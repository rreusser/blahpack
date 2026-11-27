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
* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix.
*
* ## Notes
*
* -   `s` receives reciprocal condition numbers of the selected eigenvalues (when
*     `job` is `'eigenvalues'` or `'both'`); `SEP` receives reciprocal condition
*     numbers of the eigenvectors (when `job` is `'eigenvectors'` or `'both'`).
* -   `T` must be in real Schur form (upper quasi-triangular). `dtrsna` is an
*     internal auxiliary used by the eigensolver condition-estimation path.
*
* @module @rreusser/blahpack/lapack/dtrsna
*
* @example
* import dtrsna from '@rreusser/blahpack/lapack/dtrsna';
*
* // Diagonal (hence normal) T = diag(1,2,4) with identity eigenvectors:
* var T = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 4.0 ] );
* var VL = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var VR = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
* var SELECT = new Uint8Array( 3 );
* var s = new Float64Array( 3 );
* var SEP = new Float64Array( 3 );
* var M = new Int32Array( 1 );
* var WORK = new Float64Array( 3 * 9 );
* var IWORK = new Int32Array( 4 );
*
* var info = dtrsna( 'column-major', 'both', 'all', SELECT, 1, 3, T, 3, VL, 3, VR, 3, s, 1, SEP, 1, 3, M, WORK, 3, IWORK );
* // returns 0
*
* // M[ 0 ] => 3
*
* // Eigenvalues of a normal matrix are perfectly conditioned:
* // s => <Float64Array>[ 1.0, 1.0, 1.0 ]
*
* // SEP is the distance from each eigenvalue to the nearest other one:
* // SEP => <Float64Array>[ 1.0, 1.0, 2.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrsna from './dtrsna.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrsna, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtrsna & { ndarray: typeof ndarray }} */ ( dtrsna );
export { ndarray };
