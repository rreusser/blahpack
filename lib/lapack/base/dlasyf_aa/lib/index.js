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
* Factorize a panel of a real symmetric matrix using Aasen's algorithm.
*
* @module @rreusser/blahpack/lapack/base/dlasyf_aa
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlasyfAa from '@rreusser/blahpack/lapack/base/dlasyf_aa';
*
* // Symmetric 3x3 matrix (column-major, lower triangle referenced):
* var A = new Float64Array( [ 4.0, 1.0, 2.0, 1.0, 5.0, 1.5, 2.0, 1.5, 6.0 ] );
* var H = new Float64Array( 9 );
* var WORK = new Float64Array( 3 );
* var IPIV = new Int32Array( 3 );
*
* // For the first panel ( j1 = 1 ), the first column of H must hold the first column of A:
* H.set( A.subarray( 0, 3 ) );
*
* dlasyfAa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, H, 3, WORK );
*
* // P*A*P^T = L*T*L^T with T tridiagonal; diagonal and subdiagonal of T:
* // [ A[ 0 ], A[ 4 ], A[ 8 ] ] => [ 4.0, 6.0, 5.0 ]
* // [ A[ 1 ], A[ 5 ] ] => [ 2.0, -1.5 ]
* // IPIV => <Int32Array>[ 0, 2, 2 ]
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlasyf_aa.ndarray" }
