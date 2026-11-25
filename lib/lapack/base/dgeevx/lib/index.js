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
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real nonsymmetric matrix, with optional balancing and reciprocal condition number reporting.
*
* @module @rreusser/blahpack/lapack/base/dgeevx
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dgeevx from '@rreusser/blahpack/lapack/base/dgeevx';
*
* var N = 3;
*
* // Upper triangular, column-major: A = [ [ 2, 1, 0 ], [ 0, 3, 1 ], [ 0, 0, 4 ] ]
* var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 1.0, 4.0 ] );
* var WR = new Float64Array( N );
* var WI = new Float64Array( N );
* var VL = new Float64Array( N * N );
* var VR = new Float64Array( N * N );
* var ilo = new Int32Array( 1 );
* var ihi = new Int32Array( 1 );
* var SCALE = new Float64Array( N );
* var abnrm = new Float64Array( 1 );
* var RCONDE = new Float64Array( N );
* var RCONDV = new Float64Array( N );
* var work = new Float64Array( N * ( N + 7 ) );
* var iwork = new Int32Array( 2 * ( N - 1 ) );
*
* var info = dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'both', N, A, N, WR, 1, WI, 1, VL, N, VR, N, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV, 1, work, iwork );
* // returns 0
*
* // WR => <Float64Array>[ 2.0, 3.0, 4.0 ]
* // WI => <Float64Array>[ 0.0, 0.0, 0.0 ]
* // abnrm[ 0 ] => 5.0
* // RCONDE => <Float64Array>[ ~0.6667, ~0.5, ~0.6667 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgeevx.ndarray" }
