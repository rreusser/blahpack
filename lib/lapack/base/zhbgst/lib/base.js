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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines, max-lines-per-function, no-mixed-operators, max-statements-per-line */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zgerc from '../../../../blas/base/zgerc/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlar2v from '../../zlar2v/lib/base.js';
import zlargv from '../../zlargv/lib/base.js';
import zlartg from '../../zlartg/lib/base.js';
import zlartv from '../../zlartv/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zrot from '../../zrot/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );

// Scratch array for passing complex sine to zrot
var SCRATCH_S = new Float64Array( 2 );


// FUNCTIONS //

/**
* Accesses a 2D complex banded matrix element. Returns the float64-view index.
*
* @private
* @param {integer} oA - base float64 offset for the matrix
* @param {integer} sa1 - float64 stride for first dim (row)
* @param {integer} sa2 - float64 stride for second dim (column)
* @param {integer} i - zero-based row
* @param {integer} j - zero-based column
* @returns {integer} float64 index
*/
function idx2( oA, sa1, sa2, i, j ) {
	return oA + ( i * sa1 ) + ( j * sa2 );
}


// MAIN //

/**
* Reduces a complex Hermitian-definite banded generalized eigenproblem to standard form.
*
* Reduces A_x = lambda_B_x to C_y = lambda_y, such that C has the same bandwidth as A.
_ B must have been previously factorized as S^H_S by ZPBSTF.
* A is overwritten by C = X^H_A_X, where X = S^(-1)*Q.
*
* @private
* @param {string} vect - 'none' to not form X, 'update' to form X
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {integer} ka - number of super/subdiagonals of A
* @param {integer} kb - number of super/subdiagonals of B (ka >= kb >= 0)
* @param {Complex128Array} AB - band matrix A in band storage (ka+1 by N)
* @param {integer} strideAB1 - stride of first dimension of AB (complex elements)
* @param {integer} strideAB2 - stride of second dimension of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (complex elements)
* @param {Complex128Array} BB - split Cholesky factor from ZPBSTF (kb+1 by N)
* @param {integer} strideBB1 - stride of first dimension of BB (complex elements)
* @param {integer} strideBB2 - stride of second dimension of BB (complex elements)
* @param {NonNegativeInteger} offsetBB - starting index for BB (complex elements)
* @param {Complex128Array} X - if vect='update', the N-by-N transformation matrix
* @param {integer} strideX1 - stride of first dimension of X (complex elements)
* @param {integer} strideX2 - stride of second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (complex elements)
* @param {Complex128Array} WORK - complex workspace of dimension N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of dimension N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zhbgst( vect, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, X, strideX1, strideX2, offsetX, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var update;
	var upper;
	var wantx;
	var inca;
	var ra1r;
	var ra1i;
	var bbr2;
	var bbi2;
	var ka1;
	var kb1;
	var kbt;
	var bii;
	var sA1;
	var sA2;
	var sB1;
	var sB2;
	var j1t;
	var j2t;
	var nrt;
	var ssr;
	var ssi;
	var rar;
	var rai;
	var abr;
	var abi;
	var bbr;
	var bbi;
	var i0;
	var i1;
	var i2;
	var j1;
	var j2;
	var nr;
	var nx;
	var cc;
	var Wv;
	var oW;
	var sW;
	var Ab;
	var Bb;
	var oA;
	var oB;
	var sR;
	var oR;
	var tr;
	var ti;
	var p;
	var q;
	var M; // eslint-disable-line id-length
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

	// Reinterpret complex arrays as Float64Array views
	Ab = reinterpret( AB, 0 );
	Bb = reinterpret( BB, 0 );
	Wv = reinterpret( WORK, 0 );

	// Convert complex strides/offsets to Float64 strides/offsets
	sA1 = strideAB1 * 2;
	sA2 = strideAB2 * 2;
	oA = offsetAB * 2;
	sB1 = strideBB1 * 2;
	sB2 = strideBB2 * 2;
	oB = offsetBB * 2;
	sW = strideWork * 2;
	oW = offsetWork * 2;
	sR = strideRWork;
	oR = offsetRWork;

	// INCA = LDAB * KA1 (in complex elements for zlargv stride)
	inca = strideAB2 * ka1;

	// Initialize X to the unit matrix, if needed
	if ( wantx ) {
		zlaset( 'none', N, N, CZERO, CONE, X, strideX1, strideX2, offsetX );
	}

	// Set M to the splitting point m
	M = Math.floor( ( N + kb ) / 2 );

	// ===================== Phase 1 =====================

	// Loop from I = N down to M+1 (update), then push bulges
	update = true;
	i = N; // Fortran: I = N + 1, then I = I - 1

	// Phase 1 main loop (corresponds to label 10)
	while ( true ) {
		if ( update ) {
			i -= 1; // Fortran: I = I - 1 (started from N+1, first iteration gives N)

			// But on first entry: i starts at N, so this gives N-1. Need to fix:

			// Actually Fortran sets I = N+1, then at label 10 does I = I-1 getting N.

			// In JS, we set i = N and then at top do nothing first time... Let me restructure.

			// Re-read: Fortran is I = N+1, then label 10, IF(UPDATE) I=I-1.

			// So first time through: I becomes N. Let me fix initialization.
		}
		// Break: this is complex. Let me restructure properly.
		break;
	}

	// Let me properly restructure the phase 1 loop:
	update = true;
	i = N + 1; // Fortran initialization

	// Phase 1 (corresponds to Fortran label 10)
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
			// Transform A, working with the upper triangle
			if ( update ) {
				// Form inv(S(i))^H * A * inv(S(i))
				// BII = real part of BB(KB1, I) (Fortran 1-indexed)
				bii = Bb[ idx2( oB, sB1, sB2, kb1 - 1, i - 1 ) ];

				// AB(KA1, I) = ( real(AB(KA1, I)) / BII ) / BII
				p = idx2( oA, sA1, sA2, ka1 - 1, i - 1 );
				Ab[ p ] = ( Ab[ p ] / bii ) / bii;
				Ab[ p + 1 ] = 0.0;

				// Scale row/column of A by 1/BII
				for ( j = i + 1; j <= i1; j++ ) {
					p = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}
				for ( j = Math.max( 1, i - ka ); j <= i - 1; j++ ) {
					p = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}

				// Hermitian rank-2 update on banded part
				for ( k = i - kbt; k <= i - 1; k++ ) {
					for ( j = i - kbt; j <= k; j++ ) {
						// AB(J-K+KA1,K) -= BB(J-I+KB1,I)*conj(AB(K-I+KA1,I))
						//                + conj(BB(K-I+KB1,I))*AB(J-I+KA1,I)
						//                - real(AB(KA1,I))*BB(J-I+KB1,I)*conj(BB(K-I+KB1,I))
						p = idx2( oA, sA1, sA2, j - k + ka1 - 1, k - 1 );
						q = idx2( oA, sA1, sA2, k - i + ka1 - 1, i - 1 );
						abr = Ab[ q ]; abi = Ab[ q + 1 ]; // AB(K-I+KA1,I)
						q = idx2( oB, sB1, sB2, j - i + kb1 - 1, i - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ]; // BB(J-I+KB1,I)
						q = idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ]; // BB(K-I+KB1,I)
						q = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ]; // AB(J-I+KA1,I)

						// real(AB(KA1,I))
						rar = Ab[ idx2( oA, sA1, sA2, ka1 - 1, i - 1 ) ];

						// BB(J-I+KB1,I) * conj(AB(K-I+KA1,I)) = (bbr+bbi*i)*(abr-abi*i)

						// = bbr*abr+bbi*abi + (bbi*abr-bbr*abi)*i

						// conj(BB(K-I+KB1,I)) * AB(J-I+KA1,I) = (bbr2-bbi2*i)*(tr+ti*i)

						// = bbr2*tr+bbi2*ti + (-bbi2*tr+bbr2*ti)*i

						// real(AB(KA1,I)) * BB(J-I+KB1,I) * conj(BB(K-I+KB1,I))

						// = rar * ((bbr+bbi*i)*(bbr2-bbi2*i))

						// = rar * ((bbr*bbr2+bbi*bbi2) + (bbi*bbr2-bbr*bbi2)*i)
						Ab[ p ] = Ab[ p ] -
							( bbr * abr + bbi * abi ) -
							( bbr2 * tr + bbi2 * ti ) +
							rar * ( bbr * bbr2 + bbi * bbi2 );
						Ab[ p + 1 ] = Ab[ p + 1 ] -
							( bbi * abr - bbr * abi ) -
							( -bbi2 * tr + bbr2 * ti ) +
							rar * ( bbi * bbr2 - bbr * bbi2 );
					}
					for ( j = Math.max( 1, i - ka ); j <= i - kbt - 1; j++ ) {
						p = idx2( oA, sA1, sA2, j - k + ka1 - 1, k - 1 );
						q = idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ]; // BB(K-I+KB1,I)
						q = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ]; // AB(J-I+KA1,I)

						// -= conj(BB(K-I+KB1,I)) * AB(J-I+KA1,I)
						Ab[ p ] = Ab[ p ] - ( bbr2 * tr + bbi2 * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( -bbi2 * tr + bbr2 * ti );
					}
				}
				for ( j = i; j <= i1; j++ ) {
					for ( k = Math.max( j - ka, i - kbt ); k <= i - 1; k++ ) {
						p = idx2( oA, sA1, sA2, k - j + ka1 - 1, j - 1 );
						q = idx2( oB, sB1, sB2, k - i + kb1 - 1, i - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ]; // BB(K-I+KB1,I)
						q = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ]; // AB(I-J+KA1,J)

						// -= BB(K-I+KB1,I) * AB(I-J+KA1,J)
						Ab[ p ] = Ab[ p ] - ( bbr * tr - bbi * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( bbr * ti + bbi * tr );
					}
				}

				if ( wantx ) {
					// Post-multiply X by inv(S(i))
					// ZDSCAL(N-M, ONE/BII, X(M+1,I), 1)
					zdscal( N - M, 1.0 / bii, X, strideX1, offsetX + ( M * strideX1 ) + ( ( i - 1 ) * strideX2 ) );
					if ( kbt > 0 ) {
						// ZGERC(N-M, KBT, -CONE, X(M+1,I), 1, BB(KB1-KBT,I), 1, X(M+1,I-KBT), LDX)
						zgerc( N - M, kbt, NEGCONE, X, strideX1, offsetX + ( M * strideX1 ) + ( ( i - 1 ) * strideX2 ), BB, strideBB1, offsetBB + ( kb1 - kbt - 1 ) * strideBB1 + ( i - 1 ) * strideBB2, X, strideX1, strideX2, offsetX + ( M * strideX1 ) + ( ( i - kbt - 1 ) * strideX2 ));
					}
				}

				// Store a(i,i1) in ra1 for use in next loop over K
				p = idx2( oA, sA1, sA2, i - i1 + ka1 - 1, i1 - 1 );
				ra1r = Ab[ p ];
				ra1i = Ab[ p + 1 ];
			}

			// Generate and apply vectors of rotations to chase all the existing bulges KA positions down
			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					// Determine the rotations which would annihilate the bulge
					if ( i - k + ka < N && i - k > 1 ) {
						// Generate rotation to annihilate a(i,i-k+ka+1)
						// Store RA1 in WORK[0] as g input for zlartg
						Wv[ oW ] = ra1r;
						Wv[ oW + 1 ] = ra1i;

						zlartg( AB, offsetAB + (k * strideAB1) + ((i - k + ka - 1) * strideAB2), WORK, offsetWork, RWORK, offsetRWork + ((i - k + ka - M - 1) * strideRWork), WORK, offsetWork + ((i - k + ka - M - 1) * strideWork), AB, offsetAB + (k * strideAB1) + ((i - k + ka - 1) * strideAB2) );

						// RA = r (stored back in AB(K+1, I-K+KA)), read it:
						p = idx2( oA, sA1, sA2, k, i - k + ka - 1 );
						rar = Ab[ p ];
						rai = Ab[ p + 1 ];

						// Create nonzero element a(i-k,i-k+ka+1) outside the band

						// T = -BB(KB1-K, I) * RA1
						q = idx2( oB, sB1, sB2, kb1 - k - 1, i - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						tr = -( bbr * ra1r - bbi * ra1i );
						ti = -( bbr * ra1i + bbi * ra1r );

						// Read c and s outputs

						// C = RWORK(I-K+KA-M)

						// S = WORK(I-K+KA-M)
						q = oR + ( i - k + ka - M - 1 ) * sR;
						abr = RWORK[ q ]; // c value
						q = oW + ( i - k + ka - M - 1 ) * sW;
						abi = Wv[ q ]; bbr2 = Wv[ q + 1 ]; // s value (real, imag)

						// WORK(I-K) = c*T - conj(s)*AB(1,I-K+KA)
						p = idx2( oA, sA1, sA2, 0, i - k + ka - 1 );

						// conj(s) = (abi, -bbr2)

						// c*T = abr*tr, abr*ti

						// conj(s)*AB(1,...) = (abi*Ab[p]+bbr2*Ab[p+1]) + (abi*Ab[p+1]-bbr2*Ab[p])*i
						q = oW + ( i - k - 1 ) * sW;
						Wv[ q ] = abr * tr - ( abi * Ab[ p ] + bbr2 * Ab[ p + 1 ] );
						Wv[ q + 1 ] = abr * ti - ( abi * Ab[ p + 1 ] - bbr2 * Ab[ p ] );

						// AB(1,I-K+KA) = s*T + c*AB(1,I-K+KA)
						Ab[ p ] = abi * tr + bbr2 * ti + abr * Ab[ p ]; // wrong: s*T = (abi+bbr2*i)*(tr+ti*i) = (abi*tr-bbr2*ti) + (abi*ti+bbr2*tr)*i

						// Let me redo:
						abr = Ab[ p ]; abi = Ab[ p + 1 ]; // save old AB(1,I-K+KA)
						q = oR + ( i - k + ka - M - 1 ) * sR;
						cc = RWORK[ q ];
						q = oW + ( i - k + ka - M - 1 ) * sW;
						ssr = Wv[ q ];
						ssi = Wv[ q + 1 ];

						// Redo WORK(I-K) and AB(1,I-K+KA) properly:
						q = oW + ( i - k - 1 ) * sW;
						Wv[ q ] = cc * tr - ( ssr * abr + ssi * abi ); // c*T_re - (conj(s)*AB)_re where conj(s) = (ssr,-ssi): (ssr*abr + ssi*abi)
						Wv[ q + 1 ] = cc * ti - ( ssr * abi - ssi * abr ); // c*T_im - (conj(s)*AB)_im: (ssr*abi - ssi*abr)

						// AB(1,I-K+KA) = s*T + c*AB(1,I-K+KA) where s = (ssr,ssi)

						// s*T = (ssr*tr - ssi*ti) + (ssr*ti + ssi*tr)*i
						Ab[ p ] = ( ssr * tr - ssi * ti ) + cc * abr;
						Ab[ p + 1 ] = ( ssr * ti + ssi * tr ) + cc * abi;

						ra1r = rar;
						ra1i = rai;
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

				// Create nonzero element a(j-ka,j+1) outside the band and store it in WORK(j-m)
				for ( j = j2t; j <= j1; j += ka1 ) {
					// WORK(J-M) = WORK(J-M) * AB(1, J+1)
					q = oW + ( j - M - 1 ) * sW;
					p = idx2( oA, sA1, sA2, 0, j );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;

					// AB(1, J+1) = RWORK(J-M) * AB(1, J+1)
					abr = RWORK[ oR + ( j - M - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}

				// Generate rotations in 1st set
				if ( nrt > 0 ) {
					// ZLARGV(NRT, AB(1, J2T), INCA, WORK(J2T-M), KA1, RWORK(J2T-M), KA1)
					zlargv( nrt, AB, inca, offsetAB + ( j2t - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( j2t - M - 1 ) * strideWork, RWORK, sR * ka1, oR + ( j2t - M - 1 ) * sR);
				}
				if ( nr > 0 ) {
					// Apply rotations in 1st set from the right
					for ( l = 1; l <= ka - 1; l++ ) {
						// ZLARTV(NR, AB(KA1-L, J2), INCA, AB(KA-L, J2+1), INCA, RWORK(J2-M), WORK(J2-M), KA1)
						zlartv( nr, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka - l - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);
					}

					// Apply rotations in 1st set from both sides to diagonal blocks
					// ZLAR2V(NR, AB(KA1, J2), AB(KA1, J2+1), AB(KA, J2+1), INCA, RWORK(J2-M), WORK(J2-M), KA1)
					zlar2v( nr, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + j2 * strideAB2, AB, inca, offsetAB + ( ka - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);

					// ZLACGV(NR, WORK(J2-M), KA1)
					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork );
				}

				// Start applying rotations in 1st set from the left
				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + l * strideAB1 + ( j2 + ka1 - l - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j2 + ka1 - l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					// Post-multiply X by product of rotations in 1st set
					for ( j = j2; j <= j1; j += ka1 ) {
						// ZROT(N-M, X(M+1,J), 1, X(M+1,J+1), 1, RWORK(J-M), DCONJG(WORK(J-M)))
						q = oW + ( j - M - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = -Wv[ q + 1 ]; // conjugate
						zrot( N - M, X, strideX1, offsetX + M * strideX1 + ( j - 1 ) * strideX2, X, strideX1, offsetX + M * strideX1 + j * strideX2, RWORK[ oR + ( j - M - 1 ) * sR ], SCRATCH_S);
					}
				}
			} // end k loop for 1st set

			if ( update ) {
				if ( i2 <= N && kbt > 0 ) {
					// Create nonzero element a(i-kbt,i-kbt+ka+1) outside the band
					// WORK(I-KBT) = -BB(KB1-KBT, I) * RA1
					q = idx2( oB, sB1, sB2, kb1 - kbt - 1, i - 1 );
					bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
					q = oW + ( i - kbt - 1 ) * sW;
					Wv[ q ] = -( bbr * ra1r - bbi * ra1i );
					Wv[ q + 1 ] = -( bbr * ra1i + bbi * ra1r );
				}
			}

			// 2nd set of rotations
			for ( k = kb; k >= 1; k-- ) {
				if ( update ) {
					j2 = i - k - 1 + Math.max( 2, k - i0 + 1 ) * ka1;
				} else {
					j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				}

				// Finish applying rotations in 2nd set from the left
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + ka + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + l * strideAB1 + ( j2 - l ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j2 - l ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - ka - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - ka - 1 ) * strideWork);
					}
				}
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;

				// Shift WORK and RWORK
				for ( j = j1; j >= j2; j -= ka1 ) {
					q = oW + ( j - 1 ) * sW;
					p = oW + ( j - ka - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
					RWORK[ oR + ( j - 1 ) * sR ] = RWORK[ oR + ( j - ka - 1 ) * sR ];
				}

				// Create nonzero element a(j-ka,j+1) outside the band
				for ( j = j2; j <= j1; j += ka1 ) {
					q = oW + ( j - 1 ) * sW;
					p = idx2( oA, sA1, sA2, 0, j );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( j - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}
				if ( update ) {
					if ( i - k < N - ka && k <= kbt ) {
						q = oW + ( i - k + ka - 1 ) * sW;
						p = oW + ( i - k - 1 ) * sW;
						Wv[ q ] = Wv[ p ];
						Wv[ q + 1 ] = Wv[ p + 1 ];
					}
				}
			}

			// Generate and apply rotations in 2nd set
			for ( k = kb; k >= 1; k-- ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					// Generate rotations in 2nd set
					zlargv( nr, AB, inca, offsetAB + ( j2 - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR);

					// Apply rotations in 2nd set from the right
					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka - l - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork);
					}

					// Apply rotations in 2nd set from both sides to diagonal blocks
					zlar2v( nr, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + j2 * strideAB2, AB, inca, offsetAB + ( ka - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork );
				}

				// Start applying rotations in 2nd set from the left
				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + l * strideAB1 + ( j2 + ka1 - l - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j2 + ka1 - l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j2; j <= j1; j += ka1 ) {
						q = oW + ( j - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = -Wv[ q + 1 ]; // conjugate
						zrot( N - M, X, strideX1, offsetX + M * strideX1 + ( j - 1 ) * strideX2, X, strideX1, offsetX + M * strideX1 + j * strideX2, RWORK[ oR + ( j - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			// Finish applying rotations in 1st set from the left
			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 2 ) * ka1;
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + l * strideAB1 + ( j2 + ka1 - l - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j2 + ka1 - l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);
					}
				}
			}

			// Shift RWORK/WORK for next iteration
			if ( kb > 1 ) {
				for ( j = N - 1; j >= j2 + ka; j -= 1 ) { // Fortran: DO 240 J = N-1, J2+KA, -1
					RWORK[ oR + ( j - M - 1 ) * sR ] = RWORK[ oR + ( j - ka - M - 1 ) * sR ];
					q = oW + ( j - M - 1 ) * sW;
					p = oW + ( j - ka - M - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
				}
			}
		} else {
			// *** LOWER TRIANGLE ***
			// Transform A, working with the lower triangle
			if ( update ) {
				// Form inv(S(i))^H * A * inv(S(i))
				bii = Bb[ idx2( oB, sB1, sB2, 0, i - 1 ) ];

				p = idx2( oA, sA1, sA2, 0, i - 1 );
				Ab[ p ] = ( Ab[ p ] / bii ) / bii;
				Ab[ p + 1 ] = 0.0;

				for ( j = i + 1; j <= i1; j++ ) {
					p = idx2( oA, sA1, sA2, j - i, i - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}
				for ( j = Math.max( 1, i - ka ); j <= i - 1; j++ ) {
					p = idx2( oA, sA1, sA2, i - j, j - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}

				for ( k = i - kbt; k <= i - 1; k++ ) {
					for ( j = i - kbt; j <= k; j++ ) {
						p = idx2( oA, sA1, sA2, k - j, j - 1 );
						q = idx2( oB, sB1, sB2, i - j, j - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ]; // BB(I-J+1,J)
						q = idx2( oA, sA1, sA2, i - k, k - 1 );
						abr = Ab[ q ]; abi = Ab[ q + 1 ]; // AB(I-K+1,K)
						q = idx2( oB, sB1, sB2, i - k, k - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ]; // BB(I-K+1,K)
						q = idx2( oA, sA1, sA2, i - j, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ]; // AB(I-J+1,J) -- wait, this is same as target

						// Actually the Fortran indexing is:

						// AB(K-J+1, J) -= BB(I-J+1,J)*DCONJG(AB(I-K+1,K)) + DCONJG(BB(I-K+1,K))*AB(I-J+1,J) - DBLE(AB(1,I))*BB(I-J+1,J)*DCONJG(BB(I-K+1,K))

						// Wait I need to re-read the Fortran for lower case more carefully.

						// From Fortran line 622:

						// AB(K-J+1, J) = AB(K-J+1, J) - BB(I-J+1,J)*DCONJG(AB(I-K+1,K)) - DCONJG(BB(I-K+1,K))*AB(I-J+1,J) + DBLE(AB(1,I))*BB(I-J+1,J)*DCONJG(BB(I-K+1,K))

						// But wait, AB(I-J+1, J) appears in src on RHS too. We need to read from AB(I-J+1,J) separately from AB(K-J+1,J).

						// Actually for lower: AB(K-J+1, J) and AB(I-J+1, J) are different entries since K != I (K ranges from I-KBT to I-1).

						q = idx2( oA, sA1, sA2, i - j, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ]; // AB(I-J+1,J)

						rar = Ab[ idx2( oA, sA1, sA2, 0, i - 1 ) ]; // real(AB(1,I))

						// BB(I-J+1,J)*conj(AB(I-K+1,K)) = (bbr+bbi*i)*(abr-abi*i) = (bbr*abr+bbi*abi) + (bbi*abr-bbr*abi)*i

						// conj(BB(I-K+1,K))*AB(I-J+1,J) = (bbr2-bbi2*i)*(tr+ti*i) = (bbr2*tr+bbi2*ti) + (-bbi2*tr+bbr2*ti)*i

						// real(AB(1,I))*BB(I-J+1,J)*conj(BB(I-K+1,K)) = rar*((bbr+bbi*i)*(bbr2-bbi2*i)) = rar*((bbr*bbr2+bbi*bbi2)+(bbi*bbr2-bbr*bbi2)*i)

						Ab[ p ] = Ab[ p ] -
							( bbr * abr + bbi * abi ) -
							( bbr2 * tr + bbi2 * ti ) +
							rar * ( bbr * bbr2 + bbi * bbi2 );
						Ab[ p + 1 ] = Ab[ p + 1 ] -
							( bbi * abr - bbr * abi ) -
							( -bbi2 * tr + bbr2 * ti ) +
							rar * ( bbi * bbr2 - bbr * bbi2 );
					}
					for ( j = Math.max( 1, i - ka ); j <= i - kbt - 1; j++ ) {
						p = idx2( oA, sA1, sA2, k - j, j - 1 );
						q = idx2( oB, sB1, sB2, i - k, k - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, i - j, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						Ab[ p ] = Ab[ p ] - ( bbr2 * tr + bbi2 * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( -bbi2 * tr + bbr2 * ti );
					}
				}
				for ( j = i; j <= i1; j++ ) {
					for ( k = Math.max( j - ka, i - kbt ); k <= i - 1; k++ ) {
						p = idx2( oA, sA1, sA2, j - k, k - 1 );
						q = idx2( oB, sB1, sB2, i - k, k - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, j - i, i - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						Ab[ p ] = Ab[ p ] - ( bbr * tr - bbi * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( bbr * ti + bbi * tr );
					}
				}

				if ( wantx ) {
					zdscal( N - M, 1.0 / bii, X, strideX1, offsetX + M * strideX1 + ( i - 1 ) * strideX2 );
					if ( kbt > 0 ) {
						// ZGERU(N-M, KBT, -CONE, X(M+1,I), 1, BB(KBT+1,I-KBT), LDBB-1, X(M+1,I-KBT), LDX)
						zgeru( N - M, kbt, NEGCONE, X, strideX1, offsetX + M * strideX1 + ( i - 1 ) * strideX2, BB, strideBB2 - strideBB1, offsetBB + kbt * strideBB1 + ( i - kbt - 1 ) * strideBB2, X, strideX1, strideX2, offsetX + M * strideX1 + ( i - kbt - 1 ) * strideX2);
					}
				}

				p = idx2( oA, sA1, sA2, i1 - i, i - 1 );
				ra1r = Ab[ p ];
				ra1i = Ab[ p + 1 ];
			}

			// Generate and apply vectors of rotations (lower, phase 1)
			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					if ( i - k + ka < N && i - k > 1 ) {
						// Store RA1 in temp location
						q = oW;
						Wv[ q ] = ra1r;
						Wv[ q + 1 ] = ra1i;

						zlartg(AB, offsetAB + ( ka1 - k - 1 ) * strideAB1 + ( i - 1 ) * strideAB2, WORK, offsetWork, RWORK, offsetRWork + ( i - k + ka - M - 1 ) * strideRWork, WORK, offsetWork + ( i - k + ka - M - 1 ) * strideWork, AB, offsetAB + ( ka1 - k - 1 ) * strideAB1 + ( i - 1 ) * strideAB2);

						p = idx2( oA, sA1, sA2, ka1 - k - 1, i - 1 );
						rar = Ab[ p ];
						rai = Ab[ p + 1 ];

						q = idx2( oB, sB1, sB2, k, i - k - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						tr = -( bbr * ra1r - bbi * ra1i );
						ti = -( bbr * ra1i + bbi * ra1r );

						q = oR + ( i - k + ka - M - 1 ) * sR;
						cc = RWORK[ q ];
						q = oW + ( i - k + ka - M - 1 ) * sW;
						ssr = Wv[ q ];
						ssi = Wv[ q + 1 ];

						p = idx2( oA, sA1, sA2, ka1 - 1, i - k - 1 );
						abr = Ab[ p ]; abi = Ab[ p + 1 ];

						q = oW + ( i - k - 1 ) * sW;
						Wv[ q ] = cc * tr - ( ssr * abr + ssi * abi );
						Wv[ q + 1 ] = cc * ti - ( ssr * abi - ssi * abr );

						Ab[ p ] = ( ssr * tr - ssi * ti ) + cc * abr;
						Ab[ p + 1 ] = ( ssr * ti + ssi * tr ) + cc * abi;

						ra1r = rar;
						ra1i = rai;
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
					q = oW + ( j - M - 1 ) * sW;
					p = idx2( oA, sA1, sA2, ka1 - 1, j - ka );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( j - M - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}

				if ( nrt > 0 ) {
					zlargv( nrt, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j2t - ka - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( j2t - M - 1 ) * strideWork, RWORK, sR * ka1, oR + ( j2t - M - 1 ) * sR);
				}
				if ( nr > 0 ) {
					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( l ) * strideAB1 + ( j2 - l - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j2 - l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);
					}

					zlar2v( nr, AB, inca, offsetAB + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + j2 * strideAB2, AB, inca, offsetAB + strideAB1 + ( j2 - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j2; j <= j1; j += ka1 ) {
						q = oW + ( j - M - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = Wv[ q + 1 ]; // no conjugate for lower
						zrot( N - M, X, strideX1, offsetX + M * strideX1 + ( j - 1 ) * strideX2, X, strideX1, offsetX + M * strideX1 + j * strideX2, RWORK[ oR + ( j - M - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			if ( update ) {
				if ( i2 <= N && kbt > 0 ) {
					q = idx2( oB, sB1, sB2, kbt, i - kbt - 1 );
					bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
					q = oW + ( i - kbt - 1 ) * sW;
					Wv[ q ] = -( bbr * ra1r - bbi * ra1i );
					Wv[ q + 1 ] = -( bbr * ra1i + bbi * ra1r );
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
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j2 - ka - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j2 - ka ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - ka - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - ka - 1 ) * strideWork);
					}
				}
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				for ( j = j1; j >= j2; j -= ka1 ) {
					q = oW + ( j - 1 ) * sW;
					p = oW + ( j - ka - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
					RWORK[ oR + ( j - 1 ) * sR ] = RWORK[ oR + ( j - ka - 1 ) * sR ];
				}
				for ( j = j2; j <= j1; j += ka1 ) {
					q = oW + ( j - 1 ) * sW;
					p = idx2( oA, sA1, sA2, ka1 - 1, j - ka );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( j - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}
				if ( update ) {
					if ( i - k < N - ka && k <= kbt ) {
						q = oW + ( i - k + ka - 1 ) * sW;
						p = oW + ( i - k - 1 ) * sW;
						Wv[ q ] = Wv[ p ];
						Wv[ q + 1 ] = Wv[ p + 1 ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 1 ) * ka1;
				nr = Math.floor( ( N - j2 + ka ) / ka1 );
				j1 = j2 + ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					zlargv( nr, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j2 - ka - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR);

					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( l ) * strideAB1 + ( j2 - l - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j2 - l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork);
					}

					zlar2v( nr, AB, inca, offsetAB + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + j2 * strideAB2, AB, inca, offsetAB + strideAB1 + ( j2 - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j2; j <= j1; j += ka1 ) {
						q = oW + ( j - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = Wv[ q + 1 ];
						zrot( N - M, X, strideX1, offsetX + M * strideX1 + ( j - 1 ) * strideX2, X, strideX1, offsetX + M * strideX1 + j * strideX2, RWORK[ oR + ( j - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i - k - 1 + Math.max( 1, k - i0 + 2 ) * ka1;
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( N - j2 + l ) / ka1 );
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j2 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + j2 * strideAB2, RWORK, sR * ka1, oR + ( j2 - M - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j2 - M - 1 ) * strideWork);
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = N - 1; j >= j2 + ka; j -= 1 ) {
					RWORK[ oR + ( j - M - 1 ) * sR ] = RWORK[ oR + ( j - ka - M - 1 ) * sR ];
					q = oW + ( j - M - 1 ) * sW;
					p = oW + ( j - ka - M - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
				}
			}
		}

		continue; // GO TO 10
	}

	// ===================== Phase 2 =====================
	// Label 480: Phase 2 begins
	update = true;
	i = 0;

	// Phase 2: label 490
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
				continue;
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
			// Phase 2, Upper
			if ( update ) {
				bii = Bb[ idx2( oB, sB1, sB2, kb1 - 1, i - 1 ) ];

				p = idx2( oA, sA1, sA2, ka1 - 1, i - 1 );
				Ab[ p ] = ( Ab[ p ] / bii ) / bii;
				Ab[ p + 1 ] = 0.0;

				for ( j = i1; j <= i - 1; j++ ) {
					p = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}
				for ( j = i + 1; j <= Math.min( N, i + ka ); j++ ) {
					p = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}

				for ( k = i + 1; k <= i + kbt; k++ ) {
					for ( j = k; j <= i + kbt; j++ ) {
						p = idx2( oA, sA1, sA2, k - j + ka1 - 1, j - 1 );
						q = idx2( oB, sB1, sB2, i - j + kb1 - 1, j - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, i - k + ka1 - 1, k - 1 );
						abr = Ab[ q ]; abi = Ab[ q + 1 ];
						q = idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						rar = Ab[ idx2( oA, sA1, sA2, ka1 - 1, i - 1 ) ];

						Ab[ p ] = Ab[ p ] -
							( bbr * abr + bbi * abi ) -
							( bbr2 * tr + bbi2 * ti ) +
							rar * ( bbr * bbr2 + bbi * bbi2 );
						Ab[ p + 1 ] = Ab[ p + 1 ] -
							( bbi * abr - bbr * abi ) -
							( -bbi2 * tr + bbr2 * ti ) +
							rar * ( bbi * bbr2 - bbr * bbi2 );
					}
					for ( j = i + kbt + 1; j <= Math.min( N, i + ka ); j++ ) {
						p = idx2( oA, sA1, sA2, k - j + ka1 - 1, j - 1 );
						q = idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, i - j + ka1 - 1, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						Ab[ p ] = Ab[ p ] - ( bbr2 * tr + bbi2 * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( -bbi2 * tr + bbr2 * ti );
					}
				}
				for ( j = i1; j <= i; j++ ) {
					for ( k = i + 1; k <= Math.min( j + ka, i + kbt ); k++ ) {
						p = idx2( oA, sA1, sA2, j - k + ka1 - 1, k - 1 );
						q = idx2( oB, sB1, sB2, i - k + kb1 - 1, k - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, j - i + ka1 - 1, i - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						Ab[ p ] = Ab[ p ] - ( bbr * tr - bbi * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( bbr * ti + bbi * tr );
					}
				}

				if ( wantx ) {
					zdscal( nx, 1.0 / bii, X, strideX1, offsetX + ( i - 1 ) * strideX2 );
					if ( kbt > 0 ) {
						// Fortran: ZGERU(NX, KBT, -CONE, X(1,I), 1, BB(KB,I+1), LDBB-1, X(1,I+1), LDX)
						// Note: despite Fortran using ZGERU here, BB values from ZPBSTF are real,
						// So ZGERU and ZGERC produce the same result. Using zgeru as in Fortran.
						zgeru( nx, kbt, NEGCONE, X, strideX1, offsetX + ( i - 1 ) * strideX2, BB, strideBB2 - strideBB1, offsetBB + ( kb1 - 2 ) * strideBB1 + i * strideBB2, X, strideX1, strideX2, offsetX + i * strideX2);
					}
				}

				p = idx2( oA, sA1, sA2, i1 - i + ka1 - 1, i - 1 );
				ra1r = Ab[ p ];
				ra1i = Ab[ p + 1 ];
			}

			// Generate and apply vectors of rotations (upper, phase 2)
			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					if ( i + k - ka1 > 0 && i + k < M ) {
						q = oW;
						Wv[ q ] = ra1r;
						Wv[ q + 1 ] = ra1i;

						zlartg(AB, offsetAB + ( k ) * strideAB1 + ( i - 1 ) * strideAB2, WORK, offsetWork, RWORK, offsetRWork + ( i + k - ka - 1 ) * strideRWork, WORK, offsetWork + ( i + k - ka - 1 ) * strideWork, AB, offsetAB + ( k ) * strideAB1 + ( i - 1 ) * strideAB2);

						p = idx2( oA, sA1, sA2, k, i - 1 );
						rar = Ab[ p ];
						rai = Ab[ p + 1 ];

						q = idx2( oB, sB1, sB2, kb1 - k - 1, i + k - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						tr = -( bbr * ra1r - bbi * ra1i );
						ti = -( bbr * ra1i + bbi * ra1r );

						q = oR + ( i + k - ka - 1 ) * sR;
						cc = RWORK[ q ];
						q = oW + ( i + k - ka - 1 ) * sW;
						ssr = Wv[ q ];
						ssi = Wv[ q + 1 ];

						p = idx2( oA, sA1, sA2, 0, i + k - 1 );
						abr = Ab[ p ]; abi = Ab[ p + 1 ];

						q = oW + ( M - kb + i + k - 1 ) * sW;
						Wv[ q ] = cc * tr - ( ssr * abr + ssi * abi );
						Wv[ q + 1 ] = cc * ti - ( ssr * abi - ssi * abr );

						Ab[ p ] = ( ssr * tr - ssi * ti ) + cc * abr;
						Ab[ p + 1 ] = ( ssr * ti + ssi * tr ) + cc * abi;

						ra1r = rar;
						ra1i = rai;
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
					q = oW + ( j - 1 ) * sW;
					p = idx2( oA, sA1, sA2, 0, j + ka - 2 );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( j - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}

				if ( nrt > 0 ) {
					zlargv( nrt, AB, inca, offsetAB + ( j1 + ka - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork, RWORK, sR * ka1, oR + ( j1 - 1 ) * sR);
				}
				if ( nr > 0 ) {
					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( ka - l - 1 ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork);
					}

					zlar2v( nr, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + ( ka - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( l - 1 ) * strideAB1 + ( j1t - 1 ) * strideAB2, AB, inca, offsetAB + l * strideAB1 + ( j1t - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( j1t - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1t - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						q = oW + ( j - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = Wv[ q + 1 ];
						zrot( nx, X, strideX1, offsetX + ( j - 1 ) * strideX2, X, strideX1, offsetX + ( j - 2 ) * strideX2, RWORK[ oR + ( j - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			if ( update ) {
				if ( i2 > 0 && kbt > 0 ) {
					q = idx2( oB, sB1, sB2, kb1 - kbt - 1, i + kbt - 1 );
					bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
					q = oW + ( M - kb + i + kbt - 1 ) * sW;
					Wv[ q ] = -( bbr * ra1r - bbi * ra1i );
					Wv[ q + 1 ] = -( bbr * ra1i + bbi * ra1r );
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
						zlartv( nrt, AB, inca, offsetAB + ( l - 1 ) * strideAB1 + ( j1t + ka - 1 ) * strideAB2, AB, inca, offsetAB + l * strideAB1 + ( j1t + ka - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1t + ka - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1t + ka - 1 ) * strideWork);
					}
				}
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				for ( j = j1; j <= j2; j += ka1 ) {
					q = oW + ( M - kb + j - 1 ) * sW;
					p = oW + ( M - kb + j + ka - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
					RWORK[ oR + ( M - kb + j - 1 ) * sR ] = RWORK[ oR + ( M - kb + j + ka - 1 ) * sR ];
				}
				for ( j = j1; j <= j2; j += ka1 ) {
					q = oW + ( M - kb + j - 1 ) * sW;
					p = idx2( oA, sA1, sA2, 0, j + ka - 2 );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( M - kb + j - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}
				if ( update ) {
					if ( i + k > ka1 && k <= kbt ) {
						q = oW + ( M - kb + i + k - ka - 1 ) * sW;
						p = oW + ( M - kb + i + k - 1 ) * sW;
						Wv[ q ] = Wv[ p ];
						Wv[ q + 1 ] = Wv[ p + 1 ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M ) * ka1;
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					zlargv( nr, AB, inca, offsetAB + ( j1 + ka - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork, RWORK, sR * ka1, oR + ( M - kb + j1 - 1 ) * sR);

					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( ka - l - 1 ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork);
					}

					zlar2v( nr, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + ( ka - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( l - 1 ) * strideAB1 + ( j1t - 1 ) * strideAB2, AB, inca, offsetAB + l * strideAB1 + ( j1t - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1t - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1t - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						q = oW + ( M - kb + j - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = Wv[ q + 1 ];
						zrot( nx, X, strideX1, offsetX + ( j - 1 ) * strideX2, X, strideX1, offsetX + ( j - 2 ) * strideX2, RWORK[ oR + ( M - kb + j - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M + 1 ) * ka1;
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( l - 1 ) * strideAB1 + ( j1t - 1 ) * strideAB2, AB, inca, offsetAB + l * strideAB1 + ( j1t - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( j1t - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1t - 1 ) * strideWork);
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = 2; j <= i2 - ka; j++ ) {
					RWORK[ oR + ( j - 1 ) * sR ] = RWORK[ oR + ( j + ka - 1 ) * sR ];
					q = oW + ( j - 1 ) * sW;
					p = oW + ( j + ka - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
				}
			}
		} else {
			// Phase 2, Lower
			if ( update ) {
				bii = Bb[ idx2( oB, sB1, sB2, 0, i - 1 ) ];

				p = idx2( oA, sA1, sA2, 0, i - 1 );
				Ab[ p ] = ( Ab[ p ] / bii ) / bii;
				Ab[ p + 1 ] = 0.0;

				for ( j = i1; j <= i - 1; j++ ) {
					p = idx2( oA, sA1, sA2, i - j, j - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}
				for ( j = i + 1; j <= Math.min( N, i + ka ); j++ ) {
					p = idx2( oA, sA1, sA2, j - i, i - 1 );
					Ab[ p ] = Ab[ p ] / bii;
					Ab[ p + 1 ] = Ab[ p + 1 ] / bii;
				}

				for ( k = i + 1; k <= i + kbt; k++ ) {
					for ( j = k; j <= i + kbt; j++ ) {
						p = idx2( oA, sA1, sA2, j - k, k - 1 );
						q = idx2( oB, sB1, sB2, j - i, i - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, k - i, i - 1 );
						abr = Ab[ q ]; abi = Ab[ q + 1 ];
						q = idx2( oB, sB1, sB2, k - i, i - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, j - i, i - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						rar = Ab[ idx2( oA, sA1, sA2, 0, i - 1 ) ];

						Ab[ p ] = Ab[ p ] -
							( bbr * abr + bbi * abi ) -
							( bbr2 * tr + bbi2 * ti ) +
							rar * ( bbr * bbr2 + bbi * bbi2 );
						Ab[ p + 1 ] = Ab[ p + 1 ] -
							( bbi * abr - bbr * abi ) -
							( -bbi2 * tr + bbr2 * ti ) +
							rar * ( bbi * bbr2 - bbr * bbi2 );
					}
					for ( j = i + kbt + 1; j <= Math.min( N, i + ka ); j++ ) {
						p = idx2( oA, sA1, sA2, j - k, k - 1 );
						q = idx2( oB, sB1, sB2, k - i, i - 1 );
						bbr2 = Bb[ q ]; bbi2 = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, j - i, i - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						Ab[ p ] = Ab[ p ] - ( bbr2 * tr + bbi2 * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( -bbi2 * tr + bbr2 * ti );
					}
				}
				for ( j = i1; j <= i; j++ ) {
					for ( k = i + 1; k <= Math.min( j + ka, i + kbt ); k++ ) {
						p = idx2( oA, sA1, sA2, k - j, j - 1 );
						q = idx2( oB, sB1, sB2, k - i, i - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						q = idx2( oA, sA1, sA2, i - j, j - 1 );
						tr = Ab[ q ]; ti = Ab[ q + 1 ];
						Ab[ p ] = Ab[ p ] - ( bbr * tr - bbi * ti );
						Ab[ p + 1 ] = Ab[ p + 1 ] - ( bbr * ti + bbi * tr );
					}
				}

				if ( wantx ) {
					zdscal( nx, 1.0 / bii, X, strideX1, offsetX + ( i - 1 ) * strideX2 );
					if ( kbt > 0 ) {
						zgerc( nx, kbt, NEGCONE, X, strideX1, offsetX + ( i - 1 ) * strideX2, BB, strideBB1, offsetBB + strideBB1 + ( i - 1 ) * strideBB2, X, strideX1, strideX2, offsetX + i * strideX2);
					}
				}

				p = idx2( oA, sA1, sA2, i - i1, i1 - 1 );
				ra1r = Ab[ p ];
				ra1i = Ab[ p + 1 ];
			}

			// Generate and apply vectors of rotations (lower, phase 2)
			for ( k = 1; k <= kb - 1; k++ ) {
				if ( update ) {
					if ( i + k - ka1 > 0 && i + k < M ) {
						q = oW;
						Wv[ q ] = ra1r;
						Wv[ q + 1 ] = ra1i;

						zlartg(AB, offsetAB + ( ka1 - k - 1 ) * strideAB1 + ( i + k - ka - 1 ) * strideAB2, WORK, offsetWork, RWORK, offsetRWork + ( i + k - ka - 1 ) * strideRWork, WORK, offsetWork + ( i + k - ka - 1 ) * strideWork, AB, offsetAB + ( ka1 - k - 1 ) * strideAB1 + ( i + k - ka - 1 ) * strideAB2);

						p = idx2( oA, sA1, sA2, ka1 - k - 1, i + k - ka - 1 );
						rar = Ab[ p ];
						rai = Ab[ p + 1 ];

						q = idx2( oB, sB1, sB2, k, i - 1 );
						bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
						tr = -( bbr * ra1r - bbi * ra1i );
						ti = -( bbr * ra1i + bbi * ra1r );

						q = oR + ( i + k - ka - 1 ) * sR;
						cc = RWORK[ q ];
						q = oW + ( i + k - ka - 1 ) * sW;
						ssr = Wv[ q ];
						ssi = Wv[ q + 1 ];

						p = idx2( oA, sA1, sA2, ka1 - 1, i + k - ka - 1 );
						abr = Ab[ p ]; abi = Ab[ p + 1 ];

						q = oW + ( M - kb + i + k - 1 ) * sW;
						Wv[ q ] = cc * tr - ( ssr * abr + ssi * abi );
						Wv[ q + 1 ] = cc * ti - ( ssr * abi - ssi * abr );

						Ab[ p ] = ( ssr * tr - ssi * ti ) + cc * abr;
						Ab[ p + 1 ] = ( ssr * ti + ssi * tr ) + cc * abi;

						ra1r = rar;
						ra1i = rai;
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
					q = oW + ( j - 1 ) * sW;
					p = idx2( oA, sA1, sA2, ka1 - 1, j - 2 );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( j - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}

				if ( nrt > 0 ) {
					zlargv( nrt, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork, RWORK, sR * ka1, oR + ( j1 - 1 ) * sR);
				}
				if ( nr > 0 ) {
					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( l ) * strideAB1 + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j1 - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork);
					}

					zlar2v( nr, AB, inca, offsetAB + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + strideAB1 + ( j1 - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( j1 - 1 ) * strideWork );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j1t - ka1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j1t - ka1 + l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j1t - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1t - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						q = oW + ( j - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = -Wv[ q + 1 ]; // conjugate
						zrot( nx, X, strideX1, offsetX + ( j - 1 ) * strideX2, X, strideX1, offsetX + ( j - 2 ) * strideX2, RWORK[ oR + ( j - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			if ( update ) {
				if ( i2 > 0 && kbt > 0 ) {
					q = idx2( oB, sB1, sB2, kbt, i - 1 );
					bbr = Bb[ q ]; bbi = Bb[ q + 1 ];
					q = oW + ( M - kb + i + kbt - 1 ) * sW;
					Wv[ q ] = -( bbr * ra1r - bbi * ra1i );
					Wv[ q + 1 ] = -( bbr * ra1i + bbi * ra1r );
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
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j1t + l - 2 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j1t + l - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1t + ka - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1t + ka - 1 ) * strideWork);
					}
				}
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				for ( j = j1; j <= j2; j += ka1 ) {
					q = oW + ( M - kb + j - 1 ) * sW;
					p = oW + ( M - kb + j + ka - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
					RWORK[ oR + ( M - kb + j - 1 ) * sR ] = RWORK[ oR + ( M - kb + j + ka - 1 ) * sR ];
				}
				for ( j = j1; j <= j2; j += ka1 ) {
					q = oW + ( M - kb + j - 1 ) * sW;
					p = idx2( oA, sA1, sA2, ka1 - 1, j - 2 );
					tr = Wv[ q ] * Ab[ p ] - Wv[ q + 1 ] * Ab[ p + 1 ];
					ti = Wv[ q ] * Ab[ p + 1 ] + Wv[ q + 1 ] * Ab[ p ];
					Wv[ q ] = tr;
					Wv[ q + 1 ] = ti;
					abr = RWORK[ oR + ( M - kb + j - 1 ) * sR ];
					Ab[ p ] = abr * Ab[ p ];
					Ab[ p + 1 ] = abr * Ab[ p + 1 ];
				}
				if ( update ) {
					if ( i + k > ka1 && k <= kbt ) {
						q = oW + ( M - kb + i + k - ka - 1 ) * sW;
						p = oW + ( M - kb + i + k - 1 ) * sW;
						Wv[ q ] = Wv[ p ];
						Wv[ q + 1 ] = Wv[ p + 1 ];
					}
				}
			}

			for ( k = kb; k >= 1; k-- ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M ) * ka1;
				nr = Math.floor( ( j2 + ka - 1 ) / ka1 );
				j1 = j2 - ( nr - 1 ) * ka1;
				if ( nr > 0 ) {
					zlargv( nr, AB, inca, offsetAB + ( ka1 - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork, RWORK, sR * ka1, oR + ( M - kb + j1 - 1 ) * sR);

					for ( l = 1; l <= ka - 1; l++ ) {
						zlartv( nr, AB, inca, offsetAB + ( l ) * strideAB1 + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j1 - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork);
					}

					zlar2v( nr, AB, inca, offsetAB + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + strideAB1 + ( j1 - 2 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1 - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork);

					zlacgv( nr, WORK, strideWork * ka1, offsetWork + ( M - kb + j1 - 1 ) * strideWork );
				}

				for ( l = ka - 1; l >= kb - k + 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j1t - ka1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j1t - ka1 + l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( M - kb + j1t - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( M - kb + j1t - 1 ) * strideWork);
					}
				}

				if ( wantx ) {
					for ( j = j1; j <= j2; j += ka1 ) {
						q = oW + ( M - kb + j - 1 ) * sW;
						SCRATCH_S[ 0 ] = Wv[ q ];
						SCRATCH_S[ 1 ] = -Wv[ q + 1 ]; // conjugate
						zrot( nx, X, strideX1, offsetX + ( j - 1 ) * strideX2, X, strideX1, offsetX + ( j - 2 ) * strideX2, RWORK[ oR + ( M - kb + j - 1 ) * sR ], SCRATCH_S);
					}
				}
			}

			for ( k = 1; k <= kb - 1; k++ ) {
				j2 = i + k + 1 - Math.max( 1, k + i0 - M + 1 ) * ka1;
				for ( l = kb - k; l >= 1; l-- ) {
					nrt = Math.floor( ( j2 + l - 1 ) / ka1 );
					j1t = j2 - ( nrt - 1 ) * ka1;
					if ( nrt > 0 ) {
						zlartv( nrt, AB, inca, offsetAB + ( ka1 - l ) * strideAB1 + ( j1t - ka1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( ka1 - l - 1 ) * strideAB1 + ( j1t - ka1 + l - 1 ) * strideAB2, RWORK, sR * ka1, oR + ( j1t - 1 ) * sR, WORK, strideWork * ka1, offsetWork + ( j1t - 1 ) * strideWork);
					}
				}
			}

			if ( kb > 1 ) {
				for ( j = 2; j <= i2 - ka; j++ ) {
					RWORK[ oR + ( j - 1 ) * sR ] = RWORK[ oR + ( j + ka - 1 ) * sR ];
					q = oW + ( j - 1 ) * sW;
					p = oW + ( j + ka - 1 ) * sW;
					Wv[ q ] = Wv[ p ];
					Wv[ q + 1 ] = Wv[ p + 1 ];
				}
			}
		}

		continue; // GO TO 490
	}
}


// EXPORTS //

export default zhbgst;
