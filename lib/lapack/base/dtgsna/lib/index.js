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
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form.
*
* @module @rreusser/blahpack/lapack/base/dtgsna
*
* @example
* import dtgsna from '@rreusser/blahpack/lapack/base/dtgsna';
*
* // Diagonal pencil A = diag(2,5), B = diag(1,2) with identity eigenvectors:
* var A = new Float64Array( [ 2.0, 0.0, 0.0, 5.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
* var VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var s = new Float64Array( 2 );
* var DIF = new Float64Array( 2 );
* var WORK = new Float64Array( 64 );
* var IWORK = new Int32Array( 16 );
* var SELECT = new Uint8Array( 2 );
* var M = new Int32Array( 1 );
*
* var info = dtgsna( 'column-major', 'both', 'all', SELECT, 1, 2, A, 2, B, 2, VL, 2, VR, 2, s, 1, DIF, 1, 2, M, WORK, IWORK );
* // returns 0
*
* // M[ 0 ] => 2
*
* // s(i) = sqrt( a(i)^2 + b(i)^2 ), i.e. [ sqrt(5), sqrt(29) ]:
* // s => <Float64Array>[ ~2.2360679775, ~5.3851648071 ]
* // DIF => <Float64Array>[ ~0.1856953382, ~0.1856953382 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgsna.ndarray" }
