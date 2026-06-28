/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartg from '../../dlartg/lib/base.js';
import drot from '../../../../blas/base/drot/lib/ndarray.js';


// MAIN //

/**
* Chases a 2-by-2 shift bulge in a matrix pencil `(A,B)` down a single position.
*
* ## Notes
*
* -   On entry, the bulge is located in `(A[k+1:k+3, k:k+2], B[k+1:k+3, k:k+2])` (0-based, exclusive upper bounds). On exit, the bulge is one position further down the pencil.
* -   Updates to `(A,B)` are restricted to rows `istartm:k+4` and columns `k:istopm+1`. It is assumed without checking that `istartm <= k+1` and `k+2 <= istopm`.
* -   When `k+2 == ihi`, the bulge is at the edge of the active range and the routine removes it instead of chasing.
*
* @private
* @param {boolean} ilq - determines whether or not to update the matrix `Q`
* @param {boolean} ilz - determines whether or not to update the matrix `Z`
* @param {NonNegativeInteger} k - (0-based) position of the bulge
* @param {NonNegativeInteger} istartm - (0-based) starting column/row of the active window in `(A,B)`
* @param {NonNegativeInteger} istopm - (0-based) last column of the active window in `(A,B)`
* @param {NonNegativeInteger} ihi - (0-based) index of the last row of the active Hessenberg region
* @param {Float64Array} A - matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {NonNegativeInteger} nq - order of the matrix `Q`
* @param {NonNegativeInteger} qstart - (0-based) start column index of the matrix `Q`; rotations are applied to columns `k+2-qstart .. k+4-qstart` of `Q`
* @param {Float64Array} Q - matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {NonNegativeInteger} nz - order of the matrix `Z`
* @param {NonNegativeInteger} zstart - (0-based) start column index of the matrix `Z`; rotations are applied to columns `k+1-zstart .. k+3-zstart` of `Z`
* @param {Float64Array} Z - matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
*/
function dlaqz2( ilq, ilz, k, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ ) {
	var ISTARTM;
	var ISTOPM;
	var QSTART;
	var ZSTART;
	var tmp;
	var out;
	var IHI;
	var c1;
	var s1;
	var c2;
	var s2;
	var K;
	var H;

	// Convert 0-based API indices to 1-based internals (matches Fortran source line-for-line):
	K = k + 1;
	ISTARTM = istartm + 1;
	ISTOPM = istopm + 1;
	IHI = ihi + 1;
	QSTART = qstart + 1;
	ZSTART = zstart + 1;

	// Scratch rotation output (cs, sn, r):
	out = new Float64Array( 3 );

	// H is a 2-by-3 scratch matrix stored column-major with leading dimension 2:
	H = new Float64Array( 6 );

	if ( K + 2 === IHI ) {
		// Shift is located on the edge of the matrix: remove it.
		// H = B(IHI-1:IHI, IHI-2:IHI)
		H[ 0 ] = B[ offsetB + ( (IHI-2) * strideB1 ) + ( (IHI-3) * strideB2 ) ];
		H[ 1 ] = B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-3) * strideB2 ) ];
		H[ 2 ] = B[ offsetB + ( (IHI-2) * strideB1 ) + ( (IHI-2) * strideB2 ) ];
		H[ 3 ] = B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-2) * strideB2 ) ];
		H[ 4 ] = B[ offsetB + ( (IHI-2) * strideB1 ) + ( (IHI-1) * strideB2 ) ];
		H[ 5 ] = B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-1) * strideB2 ) ];

		// Make H upper triangular via left rotation on rows 1..2:
		dlartg( H[ 0 ], H[ 1 ], out );
		c1 = out[ 0 ];
		s1 = out[ 1 ];
		tmp = out[ 2 ];
		H[ 1 ] = 0.0;
		H[ 0 ] = tmp;

		// DROT( 2, H(1,2), 2, H(2,2), 2, C1, S1 ): row 1 vs row 2 of the 2x2 block H(:, 2:3); stride along columns is 2 (ldH):
		drot( 2, H, 2, 2, H, 2, 3, c1, s1 );

		// DLARTG( H(2,3), H(2,2), C1, S1, TEMP )
		dlartg( H[ 5 ], H[ 3 ], out );
		c1 = out[ 0 ];
		s1 = out[ 1 ];

		// DROT( 1, H(1,3), 1, H(1,2), 1, C1, S1 )
		drot( 1, H, 1, 4, H, 1, 2, c1, s1 );

		// DLARTG( H(1,2), H(1,1), C2, S2, TEMP )
		dlartg( H[ 2 ], H[ 0 ], out );
		c2 = out[ 0 ];
		s2 = out[ 1 ];

		// DROT( IHI-ISTARTM+1, B(ISTARTM,IHI), 1, B(ISTARTM,IHI-1), 1, C1, S1 )
		drot( IHI - ISTARTM + 1, B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-1) * strideB2 ), B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-2) * strideB2 ), c1, s1 );
		drot( IHI - ISTARTM + 1, B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-2) * strideB2 ), B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-3) * strideB2 ), c2, s2 );
		B[ offsetB + ( (IHI-2) * strideB1 ) + ( (IHI-3) * strideB2 ) ] = 0.0;
		B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-3) * strideB2 ) ] = 0.0;
		drot( IHI - ISTARTM + 1, A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-1) * strideA2 ), A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-2) * strideA2 ), c1, s1 );
		drot( IHI - ISTARTM + 1, A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-2) * strideA2 ), A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-3) * strideA2 ), c2, s2 );
		if ( ilz ) {
			drot( nz, Z, strideZ1, offsetZ + ( (IHI-ZSTART) * strideZ2 ), Z, strideZ1, offsetZ + ( (IHI-1-ZSTART) * strideZ2 ), c1, s1 );
			drot( nz, Z, strideZ1, offsetZ + ( (IHI-1-ZSTART) * strideZ2 ), Z, strideZ1, offsetZ + ( (IHI-2-ZSTART) * strideZ2 ), c2, s2 );
		}

		// DLARTG( A(IHI-1,IHI-2), A(IHI,IHI-2), C1, S1, TEMP )
		dlartg( A[ offsetA + ( (IHI-2) * strideA1 ) + ( (IHI-3) * strideA2 ) ], A[ offsetA + ( (IHI-1) * strideA1 ) + ( (IHI-3) * strideA2 ) ], out );
		c1 = out[ 0 ];
		s1 = out[ 1 ];
		tmp = out[ 2 ];
		A[ offsetA + ( (IHI-2) * strideA1 ) + ( (IHI-3) * strideA2 ) ] = tmp;
		A[ offsetA + ( (IHI-1) * strideA1 ) + ( (IHI-3) * strideA2 ) ] = 0.0;

		// DROT( ISTOPM-IHI+2, A(IHI-1,IHI-1), LDA, A(IHI,IHI-1), LDA, C1, S1 )
		drot( ISTOPM - IHI + 2, A, strideA2, offsetA + ( (IHI-2) * strideA1 ) + ( (IHI-2) * strideA2 ), A, strideA2, offsetA + ( (IHI-1) * strideA1 ) + ( (IHI-2) * strideA2 ), c1, s1 );
		drot( ISTOPM - IHI + 2, B, strideB2, offsetB + ( (IHI-2) * strideB1 ) + ( (IHI-2) * strideB2 ), B, strideB2, offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-2) * strideB2 ), c1, s1 );
		if ( ilq ) {
			drot( nq, Q, strideQ1, offsetQ + ( (IHI-1-QSTART) * strideQ2 ), Q, strideQ1, offsetQ + ( (IHI-QSTART) * strideQ2 ), c1, s1 );
		}

		// DLARTG( B(IHI,IHI), B(IHI,IHI-1), C1, S1, TEMP )
		dlartg( B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-1) * strideB2 ) ], B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-2) * strideB2 ) ], out );
		c1 = out[ 0 ];
		s1 = out[ 1 ];
		tmp = out[ 2 ];
		B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-1) * strideB2 ) ] = tmp;
		B[ offsetB + ( (IHI-1) * strideB1 ) + ( (IHI-2) * strideB2 ) ] = 0.0;

		// DROT( IHI-ISTARTM, B(ISTARTM,IHI), 1, B(ISTARTM,IHI-1), 1, C1, S1 )
		drot( IHI - ISTARTM, B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-1) * strideB2 ), B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-2) * strideB2 ), c1, s1 );
		drot( IHI - ISTARTM + 1, A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-1) * strideA2 ), A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-2) * strideA2 ), c1, s1 );
		if ( ilz ) {
			drot( nz, Z, strideZ1, offsetZ + ( (IHI-ZSTART) * strideZ2 ), Z, strideZ1, offsetZ + ( (IHI-1-ZSTART) * strideZ2 ), c1, s1 );
		}
		return;
	}

	// Normal operation: move bulge down.
	// H = B(K+1:K+2, K:K+2) -- 2 rows x 3 columns
	H[ 0 ] = B[ offsetB + ( K * strideB1 ) + ( (K-1) * strideB2 ) ];
	H[ 1 ] = B[ offsetB + ( (K+1) * strideB1 ) + ( (K-1) * strideB2 ) ];
	H[ 2 ] = B[ offsetB + ( K * strideB1 ) + ( K * strideB2 ) ];
	H[ 3 ] = B[ offsetB + ( (K+1) * strideB1 ) + ( K * strideB2 ) ];
	H[ 4 ] = B[ offsetB + ( K * strideB1 ) + ( (K+1) * strideB2 ) ];
	H[ 5 ] = B[ offsetB + ( (K+1) * strideB1 ) + ( (K+1) * strideB2 ) ];

	// Make H upper triangular:
	dlartg( H[ 0 ], H[ 1 ], out );
	c1 = out[ 0 ];
	s1 = out[ 1 ];
	tmp = out[ 2 ];
	H[ 1 ] = 0.0;
	H[ 0 ] = tmp;

	// DROT( 2, H(1,2), 2, H(2,2), 2, C1, S1 )
	drot( 2, H, 2, 2, H, 2, 3, c1, s1 );

	// Calculate Z1 and Z2:

	// DLARTG( H(2,3), H(2,2), C1, S1, TEMP )
	dlartg( H[ 5 ], H[ 3 ], out );
	c1 = out[ 0 ];
	s1 = out[ 1 ];

	// DROT( 1, H(1,3), 1, H(1,2), 1, C1, S1 )
	drot( 1, H, 1, 4, H, 1, 2, c1, s1 );

	// DLARTG( H(1,2), H(1,1), C2, S2, TEMP )
	dlartg( H[ 2 ], H[ 0 ], out );
	c2 = out[ 0 ];
	s2 = out[ 1 ];

	// Apply transformations from the right:
	drot( K + 3 - ISTARTM + 1, A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (K+1) * strideA2 ), A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( K * strideA2 ), c1, s1 );
	drot( K + 3 - ISTARTM + 1, A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( K * strideA2 ), A, strideA1, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (K-1) * strideA2 ), c2, s2 );
	drot( K + 2 - ISTARTM + 1, B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (K+1) * strideB2 ), B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( K * strideB2 ), c1, s1 );
	drot( K + 2 - ISTARTM + 1, B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( K * strideB2 ), B, strideB1, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (K-1) * strideB2 ), c2, s2 );
	if ( ilz ) {
		// Fortran: Z(1, K+2-ZSTART+1) and Z(1, K+1-ZSTART+1). JS col = (literal) - 1:
		drot( nz, Z, strideZ1, offsetZ + ( (K+2-ZSTART) * strideZ2 ), Z, strideZ1, offsetZ + ( (K+1-ZSTART) * strideZ2 ), c1, s1 );
		drot( nz, Z, strideZ1, offsetZ + ( (K+1-ZSTART) * strideZ2 ), Z, strideZ1, offsetZ + ( (K-ZSTART) * strideZ2 ), c2, s2 );
	}
	B[ offsetB + ( K * strideB1 ) + ( (K-1) * strideB2 ) ] = 0.0;
	B[ offsetB + ( (K+1) * strideB1 ) + ( (K-1) * strideB2 ) ] = 0.0;

	// Calculate Q1 and Q2:

	// DLARTG( A(K+2,K), A(K+3,K), C1, S1, TEMP )
	dlartg( A[ offsetA + ( (K+1) * strideA1 ) + ( (K-1) * strideA2 ) ], A[ offsetA + ( (K+2) * strideA1 ) + ( (K-1) * strideA2 ) ], out );
	c1 = out[ 0 ];
	s1 = out[ 1 ];
	tmp = out[ 2 ];
	A[ offsetA + ( (K+1) * strideA1 ) + ( (K-1) * strideA2 ) ] = tmp;
	A[ offsetA + ( (K+2) * strideA1 ) + ( (K-1) * strideA2 ) ] = 0.0;

	// DLARTG( A(K+1,K), A(K+2,K), C2, S2, TEMP )
	dlartg( A[ offsetA + ( K * strideA1 ) + ( (K-1) * strideA2 ) ], A[ offsetA + ( (K+1) * strideA1 ) + ( (K-1) * strideA2 ) ], out );
	c2 = out[ 0 ];
	s2 = out[ 1 ];
	tmp = out[ 2 ];
	A[ offsetA + ( K * strideA1 ) + ( (K-1) * strideA2 ) ] = tmp;
	A[ offsetA + ( (K+1) * strideA1 ) + ( (K-1) * strideA2 ) ] = 0.0;

	// Apply transformations from the left:
	drot( ISTOPM - K, A, strideA2, offsetA + ( (K+1) * strideA1 ) + ( K * strideA2 ), A, strideA2, offsetA + ( (K+2) * strideA1 ) + ( K * strideA2 ), c1, s1 );
	drot( ISTOPM - K, A, strideA2, offsetA + ( K * strideA1 ) + ( K * strideA2 ), A, strideA2, offsetA + ( (K+1) * strideA1 ) + ( K * strideA2 ), c2, s2 );

	drot( ISTOPM - K, B, strideB2, offsetB + ( (K+1) * strideB1 ) + ( K * strideB2 ), B, strideB2, offsetB + ( (K+2) * strideB1 ) + ( K * strideB2 ), c1, s1 );
	drot( ISTOPM - K, B, strideB2, offsetB + ( K * strideB1 ) + ( K * strideB2 ), B, strideB2, offsetB + ( (K+1) * strideB1 ) + ( K * strideB2 ), c2, s2 );
	if ( ilq ) {
		// Fortran: Q(1, K+2-QSTART+1) and Q(1, K+3-QSTART+1). JS col = (literal) - 1:
		drot( nq, Q, strideQ1, offsetQ + ( (K+2-QSTART) * strideQ2 ), Q, strideQ1, offsetQ + ( (K+3-QSTART) * strideQ2 ), c1, s1 );
		drot( nq, Q, strideQ1, offsetQ + ( (K+1-QSTART) * strideQ2 ), Q, strideQ1, offsetQ + ( (K+2-QSTART) * strideQ2 ), c2, s2 );
	}
}


// EXPORTS //

export default dlaqz2;
