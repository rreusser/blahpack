/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlanv2 from '../../dlanv2/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dlarfx from '../../dlarfx/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlasy2 from '../../dlasy2/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TEN = 10.0;
var LDD = 4;
var LDX = 2;

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;


// MAIN //

/**
* Swaps adjacent diagonal blocks T11 and T22 of order 1 or 2 in an upper.
* quasi-triangular matrix T by an orthogonal similarity transformation.
*
* T must be in Schur canonical form, i.e., block upper triangular with
* 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2 diagonal block has its
* diagonal elements equal and its off-diagonal elements of opposite sign.
*
* Note: j1 is 1-based (Fortran convention).
*
* @private
* @param {boolean} wantq - if true, accumulate transformation into Q
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} T - the upper quasi-triangular matrix
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Q - orthogonal matrix (updated if wantq)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {integer} j1 - position of first block (1-based)
* @param {integer} n1 - order of first block (1 or 2)
* @param {integer} n2 - order of second block (1 or 2)
* @param {Float64Array} WORK - workspace of length N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info (0=success, 1=swap failed)
*/
function dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, j1, n1, n2, WORK, strideWork, offsetWork ) {
	var thresh;
	var lanv2r;
	var rtgOut;
	var dnorm;
	var scale;
	var xnorm;
	var temp;
	var tau1;
	var tau2;
	var tau;
	var t11;
	var t22;
	var t33;
	var cs;
	var sn;
	var nd;
	var j2;
	var j3;
	var j4;
	var u1;
	var u2;
	var k;
	var D;
	var X;
	var u;

	// Quick return
	if ( N === 0 || n1 === 0 || n2 === 0 ) {
		return 0;
	}
	if ( j1 + n1 > N ) {
		return 0;
	}

	j2 = j1 + 1;
	j3 = j1 + 2;
	j4 = j1 + 3;

	// Helper: 0-based access to T(i,j) where i,j are 1-based
	function tij( i, j ) {
		return offsetT + ( i - 1 ) * strideT1 + ( j - 1 ) * strideT2;
	}
	function qij( i, j ) {
		return offsetQ + ( i - 1 ) * strideQ1 + ( j - 1 ) * strideQ2;
	}

	if ( n1 === 1 && n2 === 1 ) {
		// Swap two 1-by-1 blocks
		t11 = T[ tij( j1, j1 ) ];
		t22 = T[ tij( j2, j2 ) ];

		// Generate Givens rotation
		rtgOut = new Float64Array( 3 );
		dlartg( T[ tij( j1, j2 ) ], t22 - t11, rtgOut );
		cs = rtgOut[ 0 ];
		sn = rtgOut[ 1 ];

		// Apply from left and right
		if ( j3 <= N ) {
			drot( N - j1 - 1, T, strideT2, tij( j1, j3 ), T, strideT2, tij( j2, j3 ), cs, sn );
		}
		drot( j1 - 1, T, strideT1, tij( 1, j1 ), T, strideT1, tij( 1, j2 ), cs, sn );

		T[ tij( j1, j1 ) ] = t22;
		T[ tij( j2, j2 ) ] = t11;

		if ( wantq ) {
			drot( N, Q, strideQ1, qij( 1, j1 ), Q, strideQ1, qij( 1, j2 ), cs, sn );
		}
	} else {
		// Larger case: at least one 2-by-2 block
		nd = n1 + n2;
		D = new Float64Array( LDD * 4 ); // 4x4 column-major with leading dim LDD
		X = new Float64Array( LDX * 2 ); // 2x2 column-major

		// Copy the diagonal block into D
		dlacpy( 'full', nd, nd, T, strideT1, strideT2, tij( j1, j1 ), D, 1, LDD, 0 );
		dnorm = dlange( 'max', nd, nd, D, 1, LDD, 0, WORK, strideWork, offsetWork );

		thresh = Math.max( TEN * EPS * dnorm, SMLNUM );

		// Solve Sylvester equation
		scale = new Float64Array( 1 );
		xnorm = new Float64Array( 1 );
		dlasy2( false, false, -1, n1, n2, D, 1, LDD, 0, D, 1, LDD, n1 * 1 + n1 * LDD, D, 1, LDD, n1 * LDD, scale, X, 1, LDX, 0, xnorm );

		k = n1 + n1 + n2 - 3;

		if ( k === 1 ) {
			// Case: N1=1, N2=2
			u = new Float64Array( 3 );
			tau = new Float64Array( 1 );
			u[ 0 ] = scale[ 0 ];
			u[ 1 ] = X[ 0 ];
			u[ 2 ] = X[ LDX ];
			dlarfg( 3, u, 2, u, 1, 0, tau, 0 );
			u[ 2 ] = ONE;
			t11 = T[ tij( j1, j1 ) ];

			// Test
			dlarfx( 'left', 3, 3, u, 1, 0, tau[ 0 ], D, 1, LDD, 0, WORK, strideWork, offsetWork );
			dlarfx( 'right', 3, 3, u, 1, 0, tau[ 0 ], D, 1, LDD, 0, WORK, strideWork, offsetWork );

			if ( Math.max( Math.abs( D[ 2 ] ), Math.abs( D[ 2 + LDD ] ), Math.abs( D[ 2 + 2 * LDD ] - t11 ) ) > thresh ) {
				return 1;
			}

			// Apply to T
			dlarfx( 'left', 3, N - j1 + 1, u, 1, 0, tau[ 0 ], T, strideT1, strideT2, tij( j1, j1 ), WORK, strideWork, offsetWork );
			dlarfx( 'right', j2, 3, u, 1, 0, tau[ 0 ], T, strideT1, strideT2, tij( 1, j1 ), WORK, strideWork, offsetWork );

			T[ tij( j3, j1 ) ] = ZERO;
			T[ tij( j3, j2 ) ] = ZERO;
			T[ tij( j3, j3 ) ] = t11;

			if ( wantq ) {
				dlarfx( 'right', N, 3, u, 1, 0, tau[ 0 ], Q, strideQ1, strideQ2, qij( 1, j1 ), WORK, strideWork, offsetWork );
			}
		} else if ( k === 2 ) {
			// Case: N1=2, N2=1
			u = new Float64Array( 3 );
			tau = new Float64Array( 1 );
			u[ 0 ] = -X[ 0 ];
			u[ 1 ] = -X[ 1 ];
			u[ 2 ] = scale[ 0 ];
			dlarfg( 3, u, 0, u, 1, 1, tau, 0 );
			u[ 0 ] = ONE;
			t33 = T[ tij( j3, j3 ) ];

			// Test
			dlarfx( 'left', 3, 3, u, 1, 0, tau[ 0 ], D, 1, LDD, 0, WORK, strideWork, offsetWork );
			dlarfx( 'right', 3, 3, u, 1, 0, tau[ 0 ], D, 1, LDD, 0, WORK, strideWork, offsetWork );

			if ( Math.max( Math.abs( D[ 1 ] ), Math.abs( D[ 2 ] ), Math.abs( D[ 0 ] - t33 ) ) > thresh ) {
				return 1;
			}

			// Apply to T
			dlarfx( 'right', j3, 3, u, 1, 0, tau[ 0 ], T, strideT1, strideT2, tij( 1, j1 ), WORK, strideWork, offsetWork );
			dlarfx( 'left', 3, N - j1, u, 1, 0, tau[ 0 ], T, strideT1, strideT2, tij( j1, j2 ), WORK, strideWork, offsetWork );

			T[ tij( j1, j1 ) ] = t33;
			T[ tij( j2, j1 ) ] = ZERO;
			T[ tij( j3, j1 ) ] = ZERO;

			if ( wantq ) {
				dlarfx( 'right', N, 3, u, 1, 0, tau[ 0 ], Q, strideQ1, strideQ2, qij( 1, j1 ), WORK, strideWork, offsetWork );
			}
		} else {
			// Case: N1=2, N2=2
			u1 = new Float64Array( 3 );
			u2 = new Float64Array( 3 );
			tau1 = new Float64Array( 1 );
			tau2 = new Float64Array( 1 );

			u1[ 0 ] = -X[ 0 ];
			u1[ 1 ] = -X[ 1 ];
			u1[ 2 ] = scale[ 0 ];
			dlarfg( 3, u1, 0, u1, 1, 1, tau1, 0 );
			u1[ 0 ] = ONE;

			temp = -tau1[ 0 ] * ( X[ LDX ] + u1[ 1 ] * X[ 1 + LDX ] );
			u2[ 0 ] = -temp * u1[ 1 ] - X[ 1 + LDX ];
			u2[ 1 ] = -temp * u1[ 2 ];
			u2[ 2 ] = scale[ 0 ];
			dlarfg( 3, u2, 0, u2, 1, 1, tau2, 0 );
			u2[ 0 ] = ONE;

			// Test
			dlarfx( 'left', 3, 4, u1, 1, 0, tau1[ 0 ], D, 1, LDD, 0, WORK, strideWork, offsetWork );
			dlarfx( 'right', 4, 3, u1, 1, 0, tau1[ 0 ], D, 1, LDD, 0, WORK, strideWork, offsetWork );
			dlarfx( 'left', 3, 4, u2, 1, 0, tau2[ 0 ], D, 1, LDD, 1, WORK, strideWork, offsetWork );
			dlarfx( 'right', 4, 3, u2, 1, 0, tau2[ 0 ], D, 1, LDD, LDD, WORK, strideWork, offsetWork );

			if ( Math.max( Math.abs( D[ 2 ] ), Math.abs( D[ 2 + LDD ] ), Math.abs( D[ 3 ] ), Math.abs( D[ 3 + LDD ] ) ) > thresh ) {
				return 1;
			}

			// Apply to T
			dlarfx( 'left', 3, N - j1 + 1, u1, 1, 0, tau1[ 0 ], T, strideT1, strideT2, tij( j1, j1 ), WORK, strideWork, offsetWork );
			dlarfx( 'right', j4, 3, u1, 1, 0, tau1[ 0 ], T, strideT1, strideT2, tij( 1, j1 ), WORK, strideWork, offsetWork );
			dlarfx( 'left', 3, N - j1 + 1, u2, 1, 0, tau2[ 0 ], T, strideT1, strideT2, tij( j2, j1 ), WORK, strideWork, offsetWork );
			dlarfx( 'right', j4, 3, u2, 1, 0, tau2[ 0 ], T, strideT1, strideT2, tij( 1, j2 ), WORK, strideWork, offsetWork );

			T[ tij( j3, j1 ) ] = ZERO;
			T[ tij( j3, j2 ) ] = ZERO;
			T[ tij( j4, j1 ) ] = ZERO;
			T[ tij( j4, j2 ) ] = ZERO;

			if ( wantq ) {
				dlarfx( 'right', N, 3, u1, 1, 0, tau1[ 0 ], Q, strideQ1, strideQ2, qij( 1, j1 ), WORK, strideWork, offsetWork );
				dlarfx( 'right', N, 3, u2, 1, 0, tau2[ 0 ], Q, strideQ1, strideQ2, qij( 1, j2 ), WORK, strideWork, offsetWork );
			}
		}

		// Standardize the 2-by-2 blocks
		if ( n2 === 2 ) {
			lanv2r = dlanv2(T[ tij( j1, j1 ) ], T[ tij( j1, j2 ) ], T[ tij( j2, j1 ) ], T[ tij( j2, j2 ) ]);
			T[ tij( j1, j1 ) ] = lanv2r.a;
			T[ tij( j1, j2 ) ] = lanv2r.b;
			T[ tij( j2, j1 ) ] = lanv2r.c;
			T[ tij( j2, j2 ) ] = lanv2r.d;
			cs = lanv2r.cs;
			sn = lanv2r.sn;
			drot( N - j1 - 1, T, strideT2, tij( j1, j1 + 2 ), T, strideT2, tij( j2, j1 + 2 ), cs, sn );
			drot( j1 - 1, T, strideT1, tij( 1, j1 ), T, strideT1, tij( 1, j2 ), cs, sn );
			if ( wantq ) {
				drot( N, Q, strideQ1, qij( 1, j1 ), Q, strideQ1, qij( 1, j2 ), cs, sn );
			}
		}

		if ( n1 === 2 ) {
			j3 = j1 + n2;
			j4 = j3 + 1;
			lanv2r = dlanv2(T[ tij( j3, j3 ) ], T[ tij( j3, j4 ) ], T[ tij( j4, j3 ) ], T[ tij( j4, j4 ) ]);
			T[ tij( j3, j3 ) ] = lanv2r.a;
			T[ tij( j3, j4 ) ] = lanv2r.b;
			T[ tij( j4, j3 ) ] = lanv2r.c;
			T[ tij( j4, j4 ) ] = lanv2r.d;
			cs = lanv2r.cs;
			sn = lanv2r.sn;
			if ( j3 + 2 <= N ) {
				drot( N - j3 - 1, T, strideT2, tij( j3, j3 + 2 ), T, strideT2, tij( j4, j3 + 2 ), cs, sn );
			}
			drot( j3 - 1, T, strideT1, tij( 1, j3 ), T, strideT1, tij( 1, j4 ), cs, sn );
			if ( wantq ) {
				drot( N, Q, strideQ1, qij( 1, j3 ), Q, strideQ1, qij( 1, j4 ), cs, sn );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dlaexc;
