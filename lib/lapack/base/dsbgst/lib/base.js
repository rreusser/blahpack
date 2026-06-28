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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines, max-lines-per-function, no-mixed-operators, max-statements-per-line */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dger from '../../../../blas/base/dger/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dlar2v from '../../dlar2v/lib/base.js';
import dlargv from '../../dlargv/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlartv from '../../dlartv/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';


// VARIABLES //

// Scratch array for dlartg output: [ c, s, r ]
var DLARTG_OUT = new Float64Array( 3 );


// FUNCTIONS //

/**
* Computes the linear index for a 2D array element.
*
* @private
* @param {integer} o - base offset
* @param {integer} s1 - stride for first dimension (row)
* @param {integer} s2 - stride for second dimension (column)
* @param {integer} i - zero-based row
* @param {integer} j - zero-based column
* @returns {integer} linear index
*/
function idx2( o, s1, s2, i, j ) {
	return o + ( i * s1 ) + ( j * s2 );
}


// MAIN //

/**
* Reduces a real symmetric-definite banded generalized eigenproblem to standard form.
*
* Reduces A_x = lambda_B_x to C_y = lambda_y, such that C has the same bandwidth as A.
_ B must have been previously factorized as S__T_S by DPBSTF.
* A is overwritten by C = X**T_A_X, where X = S**(-1)*Q.
*
* @private
* @param {string} vect - 'none' to not form X, 'update' to form X
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {integer} ka - number of super/subdiagonals of A
* @param {integer} kb - number of super/subdiagonals of B (ka >= kb >= 0)
* @param {Float64Array} AB - band matrix A in band storage (ka+1 by N)
* @param {integer} strideAB1 - stride of first dimension of AB
* @param {integer} strideAB2 - stride of second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} BB - split Cholesky factor from DPBSTF (kb+1 by N)
* @param {integer} strideBB1 - stride of first dimension of BB
* @param {integer} strideBB2 - stride of second dimension of BB
* @param {NonNegativeInteger} offsetBB - starting index for BB
* @param {Float64Array} X - if vect='update', the N-by-N transformation matrix
* @param {integer} strideX1 - stride of first dimension of X
* @param {integer} strideX2 - stride of second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {Float64Array} WORK - workspace of dimension 2*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dsbgst( vect, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, X, strideX1, strideX2, offsetX, WORK, strideWork, offsetWork ) {
	var update;
	var wantx;
	var upper;
	var ka1;
	var kb1;
	var kbt;
	var bii;
	var ra1;
	var j1t;
	var j2t;
	var nrt;
	var sA1;
	var sA2;
	var sB1;
	var sB2;
	var ra;
	var oA;
	var oB;
	var i0;
	var i1;
	var i2;
	var j1;
	var j2;
	var nr;
	var nx;
	var M; // eslint-disable-line id-length
	var p;
	var t;
	var i;
	var j;
	var k;
	var l;

	wantx = ( vect === 'update' );
	upper = ( uplo === 'upper' );
	ka1 = ka + 1;
	kb1 = kb + 1;

	if ( N === 0 ) {
		return 0;
	}

	oA = offsetAB;
	oB = offsetBB;
	sA1 = strideAB1;
	sA2 = strideAB2;
	sB1 = strideBB1;
	sB2 = strideBB2;

	// Initialize X to the unit matrix, if needed
	if ( wantx ) {
		dlaset( 'none', N, N, 0.0, 1.0, X, strideX1, strideX2, offsetX );
	}

	// Set M to the splitting point m
	M = Math.floor( ( N + kb ) / 2 );

	// ===================== Phase 1 =====================

	// Loop from I = N down to M+1 (update), then push bulges

	update = true;
	i = N + 1;

	// Phase 1 main loop (corresponds to Fortran label 10)
	while ( true ) { // eslint-disable-line no-constant-condition
		if ( update ) {
			i -= 1;
			kbt = Math.min( kb, i - 1 );
			i0 = i - 1;
			i1 = Math.min( N, i + ka );
			i2 = i - kbt + ka1;
			if ( i < M + 1 ) {
				update = false;
				i += 1;
				i0 = M;
				if ( ka === 0 ) {
					break; // GO TO 480
				}
				continue; // GO TO 10
			}
		} else {
			i += ka;
			if ( i > N - 1 ) {
				break; // GO TO 480
			}
		}

		if ( upper ) {
			// ============= UPPER triangle =============
			if ( update ) {
				// Form inv(S(i))**T * A * inv(S(i))
				bii = BB[ idx2( oB, sB1, sB2, kb1 - 1, i - 1 ) ];

				// Scale row and column of A by 1/BII
				for ( j = i; j <= i1; j++ ) {
					p = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
					AB[ p ] = AB[ p ] / bii;
				}
				for ( j = Math.max( 1, i - ka ); j <= i; j++ ) {
					p = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
					AB[ p ] = AB[ p ] / bii;
				}

				// Symmetric rank-2 update
				for ( k = i - kbt; k <= i - 1; k++ ) {
					for ( j = i - kbt; j <= k; j++ ) {
						p = idx2( oA, sA1, sA2, j - k + ka1 - 1, k - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, j - i + kb1 - 1, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, k - i + ka1 - 1, i - 1 ) ] -
							BB[ idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 ) ] +
							AB[ idx2( oA, sA1, sA2, ka1 - 1, i - 1 ) ] * BB[ idx2( oB, sB1, sB2, j - i + kb1 - 1, i - 1 ) ] *
							BB[ idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 ) ];
					}
					for ( j = Math.max( 1, i - ka ); j <= i - kbt - 1; j++ ) {
						p = idx2( oA, sA1, sA2, j - k + ka1 - 1, k - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 ) ];
					}
				}
				for ( j = i; j <= i1; j++ ) {
					for ( k = Math.max( j - ka, i - kbt ); k <= i - 1; k++ ) {
						p = idx2( oA, sA1, sA2, k - j + ka1 - 1, j - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 ) ];
					}
				}

				if ( wantx ) {
					// Post-multiply X by inv(S(i))
					dscal( N - M, 1.0 / bii, X, strideX1, offsetX + ( M * strideX1 ) + ( ( i - 1 ) * strideX2 ) );
					if ( kbt > 0 ) {
						dger( N - M, kbt, -1.0, X, strideX1, offsetX + ( M * strideX1 ) + ( ( i - 1 ) * strideX2 ), BB, strideBB1, offsetBB + ( kb1 - kbt - 1 ) * strideBB1 + ( i - 1 ) * strideBB2, X, strideX1, strideX2, offsetX + ( M * strideX1 ) + ( ( i - kbt - 1 ) * strideX2 ) );
					}
				}

				// Store a(i,i1) in ra1 for use in next loop over K
				ra1 = AB[ idx2( oA, sA1, sA2, i - i1 + ka1 - 1, i1 - 1 ) ];
			}

			// Generate and apply vectors of rotations to chase all the existing bulges KA positions down toward the bottom of the band
			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					// Determine the rotations which would annihilate the bulge
					if ( i - k + ka < N && i - k > 1 ) {
						// Generate rotation to annihilate a(i,i-k+ka+1)
						dlartg( AB[ idx2( oA, sA1, sA2, k, i - k + ka - 1 ) ], ra1, DLARTG_OUT );
						WORK[ offsetWork + ( ( N + i - k + ka - M - 1 ) * strideWork ) ] = DLARTG_OUT[ 0 ];
						WORK[ offsetWork + ( ( i - k + ka - M - 1 ) * strideWork ) ] = DLARTG_OUT[ 1 ];
						ra = DLARTG_OUT[ 2 ];

						// Create nonzero element a(i-k,i-k+ka+1) outside the band
						t = -BB[ idx2( oB, sB1, sB2, kb1 - k - 1, i - 1 ) ] * ra1;
						p = idx2( oA, sA1, sA2, 0, i - k + ka - 1 );
						WORK[ offsetWork + ( ( i - k - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + i - k + ka - M - 1 ) * strideWork ) ] * t -
							WORK[ offsetWork + ( ( i - k + ka - M - 1 ) * strideWork ) ] * AB[ p ];
						AB[ p ] = WORK[ offsetWork + ( ( i - k + ka - M - 1 ) * strideWork ) ] * t +
							WORK[ offsetWork + ( ( N + i - k + ka - M - 1 ) * strideWork ) ] * AB[ p ];
						ra1 = ra;
					}
				}
				j2 = i - k - 1 + Math.max( 1, k - i0 + 2 ) * ka1;
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				if ( update ) {
					j2t = Math.max( j2, i + 2 * ka - k + 1 );
				} else {
					j2t = j2;
				}
				nrt = Math.floor( ( N - j2t + ka ) / ka1 );
				for ( j = j2t; j <= j1; j += ka1 ) {
					// Create nonzero element a(j-1,j+ka) outside the band
					WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j ) ];
					AB[ idx2( oA, sA1, sA2, 0, j ) ] = WORK[ offsetWork + ( ( N + j - M - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j ) ];
				}

				// Generate rotations in 1st set from the top
				if ( nrt > 0 ) {
					dlargv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j2t ), WORK, ka1 * strideWork, offsetWork + ( ( j2t - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2t - M - 1 ) * strideWork ) );
				}
				if ( nr > 0 ) {
					// Apply rotations in 1st set
					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - l - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
					}

					// Apply rotations in 1st set from both sides to diagonal blocks
					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
				}

				// Start applying rotations in 1st set from the bottom
				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j2 + ka1 - l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j2 + ka1 - l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					// Post-multiply X by product of rotations in 1st set
					for ( j = j2; j <= j1; j += ka1 ) {
						drot( N - M, X, strideX1, offsetX + ( M * strideX1 ) + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( M * strideX1 ) + ( j * strideX2 ), WORK[ offsetWork + ( ( N + j - M - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] );
					}
				}
			}

			if ( update ) {
				if ( i2 <= N && kbt > 0 ) {
					// Create nonzero element a(i-kbt,i-kbt+ka+1) outside the band
					WORK[ offsetWork + ( ( i - kbt - 1 ) * strideWork ) ] = -BB[ idx2( oB, sB1, sB2, kb1 - kbt - 1, i - 1 ) ] * ra1;
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				if ( update ) {
					j2 = i - k - 1 + Math.max( 2, k - i0 + 1 ) * ka1;
				} else {
					j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				}

				// Finish applying rotations in 2nd set from the bottom
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + ka + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j2 - l ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j2 - l ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - ka - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - ka - 1 ) * strideWork ) );
					}
				}
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				for ( j = j1; j >= j2; j -= ka1 ) {
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - ka - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + j - ka - 1 ) * strideWork ) ];
				}
				for ( j = j2; j <= j1; j += ka1 ) {
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j ) ];
					AB[ idx2( oA, sA1, sA2, 0, j ) ] = WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j ) ];
				}
				if ( update ) {
					if ( i - k < N - ka && k <= kbt ) {
						WORK[ offsetWork + ( ( i - k + ka - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( i - k - 1 ) * strideWork ) ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					// Generate rotations in 2nd set to annihilate elements
					dlargv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j2 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ) );

					// Apply rotations in 2nd set
					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - l - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ) );
					}

					// Apply rotations in 2nd set from both sides to diagonal blocks
					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ) );
				}

				// Start applying rotations in 2nd set from the bottom
				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j2 + ka1 - l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j2 + ka1 - l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					// Post-multiply X by product of rotations in 2nd set
					for ( j = j2; j <= j1; j += ka1 ) {
						drot( N - M, X, strideX1, offsetX + ( M * strideX1 ) + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( M * strideX1 ) + ( j * strideX2 ), WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] );
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 2 ) * ka1;

				// Finish applying rotations in 1st set from the bottom
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j2 + ka1 - l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j2 + ka1 - l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = N - 1; j >= i - kb + 2 * ka + 1; j-- ) {
					WORK[ offsetWork + ( ( N + j - M - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + j - ka - M - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - ka - M - 1 ) * strideWork ) ];
				}
			}
		} else {
			// ============= LOWER triangle =============
			if ( update ) {
				// Form inv(S(i))**T * A * inv(S(i))
				bii = BB[ idx2( oB, sB1, sB2, 0, i - 1 ) ];

				// Scale row and column of A by 1/BII
				for ( j = i; j <= i1; j++ ) {
					p = idx2( oA, sA1, sA2, j - i, i - 1 );
					AB[ p ] = AB[ p ] / bii;
				}
				for ( j = Math.max( 1, i - ka ); j <= i; j++ ) {
					p = idx2( oA, sA1, sA2, i - j, j - 1 );
					AB[ p ] = AB[ p ] / bii;
				}

				// Symmetric rank-2 update
				for ( k = i - kbt; k <= i - 1; k++ ) {
					for ( j = i - kbt; j <= k; j++ ) {
						p = idx2( oA, sA1, sA2, k - j, j - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, i - j, j - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - k, k - 1 ) ] -
							BB[ idx2( oB, sB1, sB2, i - k, k - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - j, j - 1 ) ] +
							AB[ idx2( oA, sA1, sA2, 0, i - 1 ) ] * BB[ idx2( oB, sB1, sB2, i - j, j - 1 ) ] *
							BB[ idx2( oB, sB1, sB2, i - k, k - 1 ) ];
					}
					for ( j = Math.max( 1, i - ka ); j <= i - kbt - 1; j++ ) {
						p = idx2( oA, sA1, sA2, k - j, j - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, i - k, k - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - j, j - 1 ) ];
					}
				}
				for ( j = i; j <= i1; j++ ) {
					for ( k = Math.max( j - ka, i - kbt ); k <= i - 1; k++ ) {
						p = idx2( oA, sA1, sA2, j - k, k - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, i - k, k - 1 ) ] * AB[ idx2( oA, sA1, sA2, j - i, i - 1 ) ];
					}
				}

				if ( wantx ) {
					dscal( N - M, 1.0 / bii, X, strideX1, offsetX + ( M * strideX1 ) + ( ( i - 1 ) * strideX2 ) );
					if ( kbt > 0 ) {
						// BB(KBT+1, I-KBT) in lower storage: row kbt, col i-kbt-1
						dger( N - M, kbt, -1.0, X, strideX1, offsetX + ( M * strideX1 ) + ( ( i - 1 ) * strideX2 ), BB, strideBB2 - strideBB1, offsetBB + kbt * strideBB1 + ( i - kbt - 1 ) * strideBB2, X, strideX1, strideX2, offsetX + ( M * strideX1 ) + ( ( i - kbt - 1 ) * strideX2 ) );
					}
				}

				// Store a(i1,i) in ra1 for use in next loop over K
				ra1 = AB[ idx2( oA, sA1, sA2, i1 - i, i - 1 ) ];
			}

			// Generate and apply vectors of rotations to chase all the existing bulges KA positions down
			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					if ( i - k + ka < N && i - k > 1 ) {
						// Generate rotation to annihilate a(i-k+ka+1,i)
						dlartg( AB[ idx2( oA, sA1, sA2, ka1 - k - 1, i - 1 ) ], ra1, DLARTG_OUT );
						WORK[ offsetWork + ( ( N + i - k + ka - M - 1 ) * strideWork ) ] = DLARTG_OUT[ 0 ];
						WORK[ offsetWork + ( ( i - k + ka - M - 1 ) * strideWork ) ] = DLARTG_OUT[ 1 ];
						ra = DLARTG_OUT[ 2 ];

						// Create nonzero element a(i-k+ka+1,i-k) outside the band
						t = -BB[ idx2( oB, sB1, sB2, k, i - k - 1 ) ] * ra1;
						p = idx2( oA, sA1, sA2, ka1 - 1, i - k - 1 );
						WORK[ offsetWork + ( ( i - k - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + i - k + ka - M - 1 ) * strideWork ) ] * t -
							WORK[ offsetWork + ( ( i - k + ka - M - 1 ) * strideWork ) ] * AB[ p ];
						AB[ p ] = WORK[ offsetWork + ( ( i - k + ka - M - 1 ) * strideWork ) ] * t +
							WORK[ offsetWork + ( ( N + i - k + ka - M - 1 ) * strideWork ) ] * AB[ p ];
						ra1 = ra;
					}
				}
				j2 = i - k - 1 + Math.max( 1, k - i0 + 2 ) * ka1;
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				if ( update ) {
					j2t = Math.max( j2, i + 2 * ka - k + 1 );
				} else {
					j2t = j2;
				}
				nrt = Math.floor( ( N - j2t + ka ) / ka1 );
				for ( j = j2t; j <= j1; j += ka1 ) {
					// Create nonzero element a(j+ka,j-1) outside the band
					WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - ka ) ];
					AB[ idx2( oA, sA1, sA2, ka1 - 1, j - ka ) ] = WORK[ offsetWork + ( ( N + j - M - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - ka ) ];
				}

				// Generate rotations in 1st set from the top
				if ( nrt > 0 ) {
					dlargv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j2t - ka - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( j2t - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2t - M - 1 ) * strideWork ) );
				}
				if ( nr > 0 ) {
					// Apply rotations in 1st set
					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j2 - l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l + 1, j2 - l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
					}

					// Apply rotations in 1st set from both sides to diagonal blocks
					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 1, j2 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
				}

				// Start applying rotations in 1st set from the bottom
				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					for ( j = j2; j <= j1; j += ka1 ) {
						drot( N - M, X, strideX1, offsetX + ( M * strideX1 ) + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( M * strideX1 ) + ( j * strideX2 ), WORK[ offsetWork + ( ( N + j - M - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] );
					}
				}
			}

			if ( update ) {
				if ( i2 <= N && kbt > 0 ) {
					WORK[ offsetWork + ( ( i - kbt - 1 ) * strideWork ) ] = -BB[ idx2( oB, sB1, sB2, kbt, i - kbt - 1 ) ] * ra1;
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				if ( update ) {
					j2 = i - k - 1 + Math.max( 2, k - i0 + 1 ) * ka1;
				} else {
					j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				}

				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + ka + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j2 - ka - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j2 - ka ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - ka - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - ka - 1 ) * strideWork ) );
					}
				}
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				for ( j = j1; j >= j2; j -= ka1 ) {
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - ka - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + j - ka - 1 ) * strideWork ) ];
				}
				for ( j = j2; j <= j1; j += ka1 ) {
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - ka ) ];
					AB[ idx2( oA, sA1, sA2, ka1 - 1, j - ka ) ] = WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - ka ) ];
				}
				if ( update ) {
					if ( i - k < N - ka && k <= kbt ) {
						WORK[ offsetWork + ( ( i - k + ka - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( i - k - 1 ) * strideWork ) ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					dlargv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j2 - ka - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ) );

					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j2 - l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l + 1, j2 - l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ) );
					}

					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 1, j2 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ) );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					for ( j = j2; j <= j1; j += ka1 ) {
						drot( N - M, X, strideX1, offsetX + ( M * strideX1 ) + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( M * strideX1 ) + ( j * strideX2 ), WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] );
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 2 ) * ka1;

				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j2 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j2 - M - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j2 - M - 1 ) * strideWork ) );
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = N - 1; j >= i - kb + 2 * ka + 1; j-- ) {
					WORK[ offsetWork + ( ( N + j - M - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + j - ka - M - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( j - M - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - ka - M - 1 ) * strideWork ) ];
				}
			}
		}
	}
	// Label 480: end of phase 1

	// ===================== Phase 2 =====================
	// Loop from I = 1 up to M (update), then push bulges

	update = true;
	i = 0;

	// Phase 2 main loop (corresponds to Fortran label 490)
	while ( true ) { // eslint-disable-line no-constant-condition
		if ( update ) {
			i += 1;
			kbt = Math.min( kb, M - i );
			i0 = i + 1;
			i1 = Math.max( 1, i - ka );
			i2 = i + kbt - ka1;
			if ( i > M ) {
				update = false;
				i -= 1;
				i0 = M + 1;
				if ( ka === 0 ) {
					return 0;
				}
				continue; // GO TO 490
			}
		} else {
			i -= ka;
			if ( i < 2 ) {
				return 0;
			}
		}

		if ( i < M - kbt ) {
			nx = M;
		} else {
			nx = N;
		}

		if ( upper ) {
			// ============= UPPER triangle, phase 2 =============
			if ( update ) {
				bii = BB[ idx2( oB, sB1, sB2, kb1 - 1, i - 1 ) ];

				for ( j = i1; j <= i; j++ ) {
					p = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
					AB[ p ] = AB[ p ] / bii;
				}
				for ( j = i; j <= Math.min( N, i + ka ); j++ ) {
					p = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
					AB[ p ] = AB[ p ] / bii;
				}
				for ( k = i + 1; k <= i + kbt; k++ ) {
					for ( j = k; j <= i + kbt; j++ ) {
						p = idx2( oA, sA1, sA2, k - j + ka1 - 1, j - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, i - j + kb1 - 1, j - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - k + ka1 - 1, k - 1 ) ] -
							BB[ idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 ) ] +
							AB[ idx2( oA, sA1, sA2, ka1 - 1, i - 1 ) ] * BB[ idx2( oB, sB1, sB2, i - j + kb1 - 1, j - 1 ) ] *
							BB[ idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 ) ];
					}
					for ( j = i + kbt + 1; j <= Math.min( N, i + ka ); j++ ) {
						p = idx2( oA, sA1, sA2, k - j + ka1 - 1, j - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 ) ];
					}
				}
				for ( j = i1; j <= i; j++ ) {
					for ( k = i + 1; k <= Math.min( j + ka, i + kbt ); k++ ) {
						p = idx2( oA, sA1, sA2, j - k + ka1 - 1, k - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 ) ] * AB[ idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 ) ];
					}
				}

				if ( wantx ) {
					dscal( nx, 1.0 / bii, X, strideX1, offsetX + ( ( i - 1 ) * strideX2 ) );
					if ( kbt > 0 ) {
						// BB(KB, I+1) in upper storage: row KB-1, col I
						dger( nx, kbt, -1.0, X, strideX1, offsetX + ( ( i - 1 ) * strideX2 ), BB, strideBB2 - strideBB1, offsetBB + ( kb - 1 ) * strideBB1 + i * strideBB2, X, strideX1, strideX2, offsetX + ( i * strideX2 ) );
					}
				}

				ra1 = AB[ idx2( oA, sA1, sA2, i1 - i + ka1 - 1, i - 1 ) ];
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					if ( i + k - ka1 > 0 && i + k < M ) {
						dlartg( AB[ idx2( oA, sA1, sA2, k, i - 1 ) ], ra1, DLARTG_OUT );
						WORK[ offsetWork + ( ( N + i + k - ka - 1 ) * strideWork ) ] = DLARTG_OUT[ 0 ];
						WORK[ offsetWork + ( ( i + k - ka - 1 ) * strideWork ) ] = DLARTG_OUT[ 1 ];
						ra = DLARTG_OUT[ 2 ];

						t = -BB[ idx2( oB, sB1, sB2, kb1 - k - 1, i + k - 1 ) ] * ra1;
						p = idx2( oA, sA1, sA2, 0, i + k - 1 );
						WORK[ offsetWork + ( ( M - kb + i + k - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + i + k - ka - 1 ) * strideWork ) ] * t -
							WORK[ offsetWork + ( ( i + k - ka - 1 ) * strideWork ) ] * AB[ p ];
						AB[ p ] = WORK[ offsetWork + ( ( i + k - ka - 1 ) * strideWork ) ] * t +
							WORK[ offsetWork + ( ( N + i + k - ka - 1 ) * strideWork ) ] * AB[ p ];
						ra1 = ra;
					}
				}
				j2 = i + k + 1 - Math.max( 1, k + i0 - M + 1 ) * ka1;
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				if ( update ) {
					j2t = Math.min( j2, i - 2 * ka + k - 1 );
				} else {
					j2t = j2;
				}
				nrt = Math.floor( ( j2t + ka - 1 ) / ka1 );
				for ( j = j1; j <= j2t; j += ka1 ) {
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j + ka - 2 ) ];
					AB[ idx2( oA, sA1, sA2, 0, j + ka - 2 ) ] = WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j + ka - 2 ) ];
				}

				if ( nrt > 0 ) {
					dlargv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j1 + ka - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1 - 1 ) * strideWork ) );
				}
				if ( nr > 0 ) {
					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j1 + l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - l - 1, j1 + l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ) );
					}

					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j1 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j1 - 2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - 1, j1 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ) );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j1t - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j1t - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1t - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1t - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						drot( nx, X, strideX1, offsetX + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( ( j - 2 ) * strideX2 ), WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] );
					}
				}
			}

			if ( update ) {
				if ( i2 > 0 && kbt > 0 ) {
					WORK[ offsetWork + ( ( M - kb + i + kbt - 1 ) * strideWork ) ] = -BB[ idx2( oB, sB1, sB2, kb1 - kbt - 1, i + kbt - 1 ) ] * ra1;
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				if ( update ) {
					j2 = i + k + 1 - Math.max( 2, k + i0 - M ) * ka1;
				} else {
					j2 = i + k + 1 - Math.max( 1, k + i0 - M ) * ka1;
				}

				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( j2 + ka + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j1t + ka - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j1t + ka - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1t + ka - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1t + ka - 1 ) * strideWork ) );
					}
				}
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				for ( j = j1; j <= j2; j += ka1 ) {
					WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( M - kb + j + ka - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( N + M - kb + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + M - kb + j + ka - 1 ) * strideWork ) ];
				}
				for ( j = j1; j <= j2; j += ka1 ) {
					WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j + ka - 2 ) ];
					AB[ idx2( oA, sA1, sA2, 0, j + ka - 2 ) ] = WORK[ offsetWork + ( ( N + M - kb + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, 0, j + ka - 2 ) ];
				}
				if ( update ) {
					if ( i + k > ka1 && k <= kbt ) {
						WORK[ offsetWork + ( ( M - kb + i + k - ka - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( M - kb + i + k - 1 ) * strideWork ) ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M ) * ka1;
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					dlargv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j1 + ka - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1 - 1 ) * strideWork ) );

					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j1 + l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - l - 1, j1 + l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1 - 1 ) * strideWork ) );
					}

					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j1 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j1 - 2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka - 1, j1 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1 - 1 ) * strideWork ) );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j1t - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j1t - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1t - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1t - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						drot( nx, X, strideX1, offsetX + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( ( j - 2 ) * strideX2 ), WORK[ offsetWork + ( ( N + M - kb + j - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] );
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M + 1 ) * ka1;

				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, l - 1, j1t - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j1t - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1t - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1t - 1 ) * strideWork ) );
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = 2; j <= Math.min( i + kb, M ) - 2 * ka - 1; j++ ) {
					WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + j + ka - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j + ka - 1 ) * strideWork ) ];
				}
			}
		} else {
			// ============= LOWER triangle, phase 2 =============
			if ( update ) {
				bii = BB[ idx2( oB, sB1, sB2, 0, i - 1 ) ];

				for ( j = i1; j <= i; j++ ) {
					p = idx2( oA, sA1, sA2, i - j, j - 1 );
					AB[ p ] = AB[ p ] / bii;
				}
				for ( j = i; j <= Math.min( N, i + ka ); j++ ) {
					p = idx2( oA, sA1, sA2, j - i, i - 1 );
					AB[ p ] = AB[ p ] / bii;
				}
				for ( k = i + 1; k <= i + kbt; k++ ) {
					for ( j = k; j <= i + kbt; j++ ) {
						p = idx2( oA, sA1, sA2, j - k, k - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, j - i, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, k - i, i - 1 ) ] -
							BB[ idx2( oB, sB1, sB2, k - i, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, j - i, i - 1 ) ] +
							AB[ idx2( oA, sA1, sA2, 0, i - 1 ) ] * BB[ idx2( oB, sB1, sB2, j - i, i - 1 ) ] *
							BB[ idx2( oB, sB1, sB2, k - i, i - 1 ) ];
					}
					for ( j = i + kbt + 1; j <= Math.min( N, i + ka ); j++ ) {
						p = idx2( oA, sA1, sA2, j - k, k - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, k - i, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, j - i, i - 1 ) ];
					}
				}
				for ( j = i1; j <= i; j++ ) {
					for ( k = i + 1; k <= Math.min( j + ka, i + kbt ); k++ ) {
						p = idx2( oA, sA1, sA2, k - j, j - 1 );
						AB[ p ] = AB[ p ] -
							BB[ idx2( oB, sB1, sB2, k - i, i - 1 ) ] * AB[ idx2( oA, sA1, sA2, i - j, j - 1 ) ];
					}
				}

				if ( wantx ) {
					dscal( nx, 1.0 / bii, X, strideX1, offsetX + ( ( i - 1 ) * strideX2 ) );
					if ( kbt > 0 ) {
						dger( nx, kbt, -1.0, X, strideX1, offsetX + ( ( i - 1 ) * strideX2 ), BB, strideBB1, offsetBB + 1 * strideBB1 + ( i - 1 ) * strideBB2, X, strideX1, strideX2, offsetX + ( i * strideX2 ) );
					}
				}

				ra1 = AB[ idx2( oA, sA1, sA2, i - i1, i1 - 1 ) ];
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					if ( i + k - ka1 > 0 && i + k < M ) {
						dlartg( AB[ idx2( oA, sA1, sA2, ka1 - k - 1, i + k - ka - 1 ) ], ra1, DLARTG_OUT );
						WORK[ offsetWork + ( ( N + i + k - ka - 1 ) * strideWork ) ] = DLARTG_OUT[ 0 ];
						WORK[ offsetWork + ( ( i + k - ka - 1 ) * strideWork ) ] = DLARTG_OUT[ 1 ];
						ra = DLARTG_OUT[ 2 ];

						t = -BB[ idx2( oB, sB1, sB2, k, i - 1 ) ] * ra1;
						p = idx2( oA, sA1, sA2, ka1 - 1, i + k - ka - 1 );
						WORK[ offsetWork + ( ( M - kb + i + k - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + i + k - ka - 1 ) * strideWork ) ] * t -
							WORK[ offsetWork + ( ( i + k - ka - 1 ) * strideWork ) ] * AB[ p ];
						AB[ p ] = WORK[ offsetWork + ( ( i + k - ka - 1 ) * strideWork ) ] * t +
							WORK[ offsetWork + ( ( N + i + k - ka - 1 ) * strideWork ) ] * AB[ p ];
						ra1 = ra;
					}
				}
				j2 = i + k + 1 - Math.max( 1, k + i0 - M + 1 ) * ka1;
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				if ( update ) {
					j2t = Math.min( j2, i - 2 * ka + k - 1 );
				} else {
					j2t = j2;
				}
				nrt = Math.floor( ( j2t + ka - 1 ) / ka1 );
				for ( j = j1; j <= j2t; j += ka1 ) {
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - 2 ) ];
					AB[ idx2( oA, sA1, sA2, ka1 - 1, j - 2 ) ] = WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - 2 ) ];
				}

				if ( nrt > 0 ) {
					dlargv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j1 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1 - 1 ) * strideWork ) );
				}
				if ( nr > 0 ) {
					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j1 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l + 1, j1 - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ) );
					}

					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j1 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j1 - 2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 1, j1 - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ) );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j1t - ka1 + l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j1t - ka1 + l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1t - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1t - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						drot( nx, X, strideX1, offsetX + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( ( j - 2 ) * strideX2 ), WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] );
					}
				}
			}

			if ( update ) {
				if ( i2 > 0 && kbt > 0 ) {
					WORK[ offsetWork + ( ( M - kb + i + kbt - 1 ) * strideWork ) ] = -BB[ idx2( oB, sB1, sB2, kbt, i - 1 ) ] * ra1;
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				if ( update ) {
					j2 = i + k + 1 - Math.max( 2, k + i0 - M ) * ka1;
				} else {
					j2 = i + k + 1 - Math.max( 1, k + i0 - M ) * ka1;
				}

				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( j2 + ka + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j1t + l - 2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j1t + l - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1t + ka - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1t + ka - 1 ) * strideWork ) );
					}
				}
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				for ( j = j1; j <= j2; j += ka1 ) {
					WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( M - kb + j + ka - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( N + M - kb + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + M - kb + j + ka - 1 ) * strideWork ) ];
				}
				for ( j = j1; j <= j2; j += ka1 ) {
					WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - 2 ) ];
					AB[ idx2( oA, sA1, sA2, ka1 - 1, j - 2 ) ] = WORK[ offsetWork + ( ( N + M - kb + j - 1 ) * strideWork ) ] * AB[ idx2( oA, sA1, sA2, ka1 - 1, j - 2 ) ];
				}
				if ( update ) {
					if ( i + k > ka1 && k <= kbt ) {
						WORK[ offsetWork + ( ( M - kb + i + k - ka - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( M - kb + i + k - 1 ) * strideWork ) ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M ) * ka1;
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					dlargv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - 1, j1 - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1 - 1 ) * strideWork ) );

					for ( l = 1; l <= ka - 1; l++ ) {
						dlartv( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, l, j1 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, l + 1, j1 - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1 - 1 ) * strideWork ) );
					}

					dlar2v( nr, AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j1 - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 0, j1 - 2 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, 1, j1 - 2 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1 - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1 - 1 ) * strideWork ) );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j1t - ka1 + l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j1t - ka1 + l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + M - kb + j1t - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( M - kb + j1t - 1 ) * strideWork ) );
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						drot( nx, X, strideX1, offsetX + ( ( j - 1 ) * strideX2 ), X, strideX1, offsetX + ( ( j - 2 ) * strideX2 ), WORK[ offsetWork + ( ( N + M - kb + j - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( M - kb + j - 1 ) * strideWork ) ] );
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M + 1 ) * ka1;

				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						dlartv( nrt, AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l, j1t - ka1 + l - 1 ), AB, sA2 * ka1, idx2( oA, sA1, sA2, ka1 - l - 1, j1t - ka1 + l - 1 ), WORK, ka1 * strideWork, offsetWork + ( ( N + j1t - 1 ) * strideWork ), WORK, ka1 * strideWork, offsetWork + ( ( j1t - 1 ) * strideWork ) );
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = 2; j <= Math.min( i + kb, M ) - 2 * ka - 1; j++ ) {
					WORK[ offsetWork + ( ( N + j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( N + j + ka - 1 ) * strideWork ) ];
					WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = WORK[ offsetWork + ( ( j + ka - 1 ) * strideWork ) ];
				}
			}
		}
	}
}


// EXPORTS //

export default dsbgst;
