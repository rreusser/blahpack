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
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/base/ztgsen
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztgsen from '@rreusser/blahpack/lapack/base/ztgsen';
*
* // Diagonal pencil (A, I) with eigenvalues 1+i and 2 (column-major):
* var A = new Complex128Array( [ 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
*
* // Select the second eigenvalue to move it to the leading position:
* var SELECT = new Uint8Array( [ 0, 1 ] );
* var ALPHA = new Complex128Array( 2 );
* var BETA = new Complex128Array( 2 );
* var M = new Int32Array( 1 );
* var pl = new Float64Array( 1 );
* var pr = new Float64Array( 1 );
* var DIF = new Float64Array( 2 );
* var WORK = new Complex128Array( 16 );
* var IWORK = new Int32Array( 8 );
*
* var info = ztgsen( 'column-major', 1, true, true, SELECT, 1, 2, A, 2, B, 2, ALPHA, 1, BETA, 1, Q, 2, Z, 2, M, pl, pr, DIF, 1, WORK, IWORK );
* // returns 0
*
* // M[ 0 ] => 1
* // ALPHA => <Complex128Array>[ 2.0, 0.0, 1.0, 1.0 ]
* // BETA => <Complex128Array>[ 1.0, 0.0, 1.0, 0.0 ]
*
* // For a diagonal pencil the projections onto the deflating subspaces have unit norm:
* // pl[ 0 ] => 1.0
* // pr[ 0 ] => 1.0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztgsen.ndarray" }
