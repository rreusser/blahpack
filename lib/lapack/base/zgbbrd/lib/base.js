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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlartg from './../../zlartg/lib/base.js';
import zlargv from './../../zlargv/lib/base.js';
import zlartv from './../../zlartv/lib/base.js';
import zlaset from './../../zlaset/lib/base.js';
import zrot from './../../zrot/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Reduces a complex general m-by-n band matrix A to real upper bidiagonal.
* form B by a unitary transformation: `Q**H * A * P = B`.
*
* The routine computes B, and optionally forms Q or P**H, or computes.
* Q**H*C for a given matrix C.
*
* @private
* @param {string} vect - `'no-vectors'` (neither Q nor PT), `'q-only'` (Q), `'p-only'` (PT), or `'both'` (both)
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} ncc - number of columns of C
* @param {NonNegativeInteger} kl - number of sub-diagonals of A
* @param {NonNegativeInteger} ku - number of super-diagonals of A
* @param {Complex128Array} AB - band matrix (KL+KU+1 by N)
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Float64Array} d - diagonal of B (length >= min(M,N))
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - super-diagonal of B (length >= min(M,N)-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} Q - on exit, the m-by-m unitary matrix Q (if wantq)
* @param {integer} strideQ1 - stride of the first dimension of `Q` (in complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (in complex elements)
* @param {Complex128Array} PT - on exit, the n-by-n unitary matrix P**H (if wantpt)
* @param {integer} stridePT1 - stride of the first dimension of `PT` (in complex elements)
* @param {integer} stridePT2 - stride of the second dimension of `PT` (in complex elements)
* @param {NonNegativeInteger} offsetPT - starting index for `PT` (in complex elements)
* @param {Complex128Array} C - on input, m-by-ncc matrix C; on exit, Q**H*C
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - complex workspace (length >= max(M,N))
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace (length >= max(M,N))
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} status code (0 = success)
*/
function zgbbrd( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var wantpt;
	var wantb;
	var wantq;
	var wantc;
	var minmn;
	var WORKv;
	var sWORK;
	var oWORK;
	var raArr;
	var rbArr;
	var klu1;
	var inca;
	var sAB1;
	var sAB2;
	var svec;
	var abst;
	var kuml;
	var kumu;
	var newR;
	var newI;
	var kb1;
	var klm;
	var kun;
	var ml0;
	var mu0;
	var nrt;
	var ABv;
	var oAB;
	var sRW;
	var oRW;
	var ipR;
	var ipS;
	var raV;
	var rbR;
	var rbI;
	var rbV;
	var csR;
	var csI;
	var kb;
	var nr;
	var j1;
	var j2;
	var ml;
	var mu;
	var kk;
	var sD;
	var sE;
	var ip;
	var tR;
	var tI;
	var t0;
	var t1;
	var oi;
	var i;
	var j;
	var l;

	wantb = ( vect === 'both' );
	wantq = ( vect === 'q-only' ) || wantb;
	wantpt = ( vect === 'p-only' ) || wantb;
	wantc = ( ncc > 0 );
	klu1 = kl + ku + 1;

	// Quick return
	if ( wantq ) {
		zlaset( 'full', M, M, CZERO, CONE, Q, strideQ1, strideQ2, offsetQ );
	}
	if ( wantpt ) {
		zlaset( 'full', N, N, CZERO, CONE, PT, stridePT1, stridePT2, offsetPT );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minmn = Math.min( M, N );

	// Float64 views and stride conversions:
	ABv = reinterpret( AB, 0 );
	sAB1 = strideAB1 * 2;
	sAB2 = strideAB2 * 2;
	oAB = offsetAB * 2;

	WORKv = reinterpret( WORK, 0 );
	sWORK = strideWork * 2;
	oWORK = offsetWork * 2;

	sD = strideD;
	sE = strideE;
	sRW = strideRWork;
	oRW = offsetRWork;

	// Scratch for zlartg RA output
	raArr = new Complex128Array( 1 );
	raV = reinterpret( raArr, 0 );

	// Scratch for zrot S argument (real 2-element [re, im])
	svec = new Float64Array( 2 );

	// Helper: complex-index into Float64 view of AB for AB(row1, col1) (both 1-based Fortran indices):

	// f_offset = oAB + ( (row-1) * sAB1 ) + ( (col-1) * sAB2 )

	if ( kl + ku > 1 ) {
		// Reduce by diagonals
		if ( ku > 0 ) {
			ml0 = 1;
			mu0 = 2;
		} else {
			ml0 = 2;
			mu0 = 1;
		}

		klm = Math.min( M - 1, kl );
		kun = Math.min( N - 1, ku );
		kb = klm + kun;
		kb1 = kb + 1;
		inca = kb1 * strideAB1; // in complex elements
		nr = 0;
		j1 = klm + 2;
		j2 = 1 - kun;

		for ( i = 1; i <= minmn; i++ ) {
			ml = klm + 1;
			mu = kun + 1;
			for ( kk = 1; kk <= kb; kk++ ) {
				j1 += kb;
				j2 += kb;

				// ZLARGV: generate plane rotations to annihilate nonzeros from previous sweep
				if ( nr > 0 ) {
					// X = AB(klu1, j1-klm-1), y = WORK(j1), c = RWORK(j1)
					zlargv(nr, AB, inca, offsetAB + ( ( klu1 - 1 ) * strideAB1 ) + ( ( j1 - klm - 2 ) * strideAB2 ), WORK, kb1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ), RWORK, kb1 * sRW, oRW + ( ( j1 - 1 ) * sRW ));
				}

				// ZLARTV: apply rotations from left to inside the band
				for ( l = 1; l <= kb; l++ ) {
					if ( j2 - klm + l - 1 > N ) {
						nrt = nr - 1;
					} else {
						nrt = nr;
					}
					if ( nrt > 0 ) {
						zlartv(nrt, AB, inca, offsetAB + ( ( klu1 - l - 1 ) * strideAB1 ) + ( ( j1 - klm + l - 2 ) * strideAB2 ), AB, inca, offsetAB + ( ( klu1 - l ) * strideAB1 ) + ( ( j1 - klm + l - 2 ) * strideAB2 ), RWORK, kb1 * sRW, oRW + ( ( j1 - 1 ) * sRW ), WORK, kb1 * strideWork, offsetWork + ( ( j1 - 1 ) * strideWork ));
					}
				}

				if ( ml > ml0 ) {
					if ( ml <= M - i + 1 ) {
						// Generate plane rotation from AB(ku+ml-1, i), AB(ku+ml, i)
						// Output c -> RWORK(i+ml-1), s -> WORK(i+ml-1), r -> AB(ku+ml-1, i)
						zlartg(AB, offsetAB + ( ( ku + ml - 2 ) * strideAB1 ) + ( ( i - 1 ) * strideAB2 ), AB, offsetAB + ( ( ku + ml - 1 ) * strideAB1 ) + ( ( i - 1 ) * strideAB2 ), RWORK, oRW + ( ( i + ml - 2 ) * sRW ), WORK, offsetWork + ( ( i + ml - 2 ) * strideWork ), raArr, 0);

						// AB(ku+ml-1, i) = ra
						ip = oAB + ( ( ku + ml - 2 ) * sAB1 ) + ( ( i - 1 ) * sAB2 );
						ABv[ ip ] = raV[ 0 ];
						ABv[ ip + 1 ] = raV[ 1 ];

						if ( i < N ) {
							// zrot( min(ku+ml-2, N-i), AB(ku+ml-2, i+1), LDAB-1, AB(ku+ml-1, i+1), LDAB-1, c, s )
							kuml = Math.min( ku + ml - 2, N - i );

							// s-vector from WORK(i+ml-1)
							ipS = oWORK + ( ( i + ml - 2 ) * sWORK );
							svec[ 0 ] = WORKv[ ipS ];
							svec[ 1 ] = WORKv[ ipS + 1 ];
							ipR = oRW + ( ( i + ml - 2 ) * sRW );

							// LDAB-1 in complex elements == strideAB2 - strideAB1
							zrot(kuml, AB, strideAB2 - strideAB1, offsetAB + ( ( ku + ml - 3 ) * strideAB1 ) + ( i * strideAB2 ), AB, strideAB2 - strideAB1, offsetAB + ( ( ku + ml - 2 ) * strideAB1 ) + ( i * strideAB2 ), RWORK[ ipR ], svec);
						}
					}
					nr += 1;
					j1 -= kb1;
				}

				if ( wantq ) {
					// Accumulate left rotations into Q (using conj(WORK(j)))
					for ( j = j1; j <= j2; j += kb1 ) {
						ipS = oWORK + ( ( j - 1 ) * sWORK );
						svec[ 0 ] = WORKv[ ipS ];
						svec[ 1 ] = -WORKv[ ipS + 1 ]; // conjg
						ipR = oRW + ( ( j - 1 ) * sRW );
						zrot(M, Q, strideQ1, offsetQ + ( ( j - 2 ) * strideQ2 ), Q, strideQ1, offsetQ + ( ( j - 1 ) * strideQ2 ), RWORK[ ipR ], svec);
					}
				}

				if ( wantc ) {
					// Apply left rotations to C
					for ( j = j1; j <= j2; j += kb1 ) {
						ipS = oWORK + ( ( j - 1 ) * sWORK );
						svec[ 0 ] = WORKv[ ipS ];
						svec[ 1 ] = WORKv[ ipS + 1 ];
						ipR = oRW + ( ( j - 1 ) * sRW );
						zrot(ncc, C, strideC2, offsetC + ( ( j - 2 ) * strideC1 ), C, strideC2, offsetC + ( ( j - 1 ) * strideC1 ), RWORK[ ipR ], svec);
					}
				}

				if ( j2 + kun > N ) {
					nr -= 1;
					j2 -= kb1;
				}

				// Create nonzero element a(j-1,j+ku) above the band and store it in work
				for ( j = j1; j <= j2; j += kb1 ) {
					// WORK(j+kun) = WORK(j) * AB(1, j+kun)
					// AB(1, j+kun) = RWORK(j) * AB(1, j+kun)
					oi = oAB + 0 + ( ( j + kun - 1 ) * sAB2 ); // row 1 (Fortran) = row 0 in [Float64, *2]
					tR = ABv[ oi ];
					tI = ABv[ oi + 1 ];
					ipS = oWORK + ( ( j - 1 ) * sWORK );
					t0 = WORKv[ ipS ];
					t1 = WORKv[ ipS + 1 ];

					// WORK(j+kun) = (t0+t1*i) * (tR+tI*i)
					ip = oWORK + ( ( j + kun - 1 ) * sWORK );
					WORKv[ ip ] = ( t0 * tR ) - ( t1 * tI );
					WORKv[ ip + 1 ] = ( t0 * tI ) + ( t1 * tR );

					// AB(1, j+kun) = RWORK(j) * (tR, tI)
					ipR = oRW + ( ( j - 1 ) * sRW );
					ABv[ oi ] = RWORK[ ipR ] * tR;
					ABv[ oi + 1 ] = RWORK[ ipR ] * tI;
				}

				// Generate plane rotations to annihilate nonzero elements which have been created outside the band
				if ( nr > 0 ) {
					zlargv(nr, AB, inca, offsetAB + 0 + ( ( j1 + kun - 2 ) * strideAB2 ), WORK, kb1 * strideWork, offsetWork + ( ( j1 + kun - 1 ) * strideWork ), RWORK, kb1 * sRW, oRW + ( ( j1 + kun - 1 ) * sRW ));
				}

				// Apply plane rotations from the right
				for ( l = 1; l <= kb; l++ ) {
					if ( j2 + l - 1 > M ) {
						nrt = nr - 1;
					} else {
						nrt = nr;
					}
					if ( nrt > 0 ) {
						zlartv(nrt, AB, inca, offsetAB + ( l * strideAB1 ) + ( ( j1 + kun - 2 ) * strideAB2 ), AB, inca, offsetAB + ( ( l - 1 ) * strideAB1 ) + ( ( j1 + kun - 1 ) * strideAB2 ), RWORK, kb1 * sRW, oRW + ( ( j1 + kun - 1 ) * sRW ), WORK, kb1 * strideWork, offsetWork + ( ( j1 + kun - 1 ) * strideWork ));
					}
				}

				if ( ml === ml0 && mu > mu0 ) {
					if ( mu <= N - i + 1 ) {
						// ZLARTG from AB(ku-mu+3, i+mu-2), AB(ku-mu+2, i+mu-1)
						zlartg(AB, offsetAB + ( ( ku - mu + 2 ) * strideAB1 ) + ( ( i + mu - 3 ) * strideAB2 ), AB, offsetAB + ( ( ku - mu + 1 ) * strideAB1 ) + ( ( i + mu - 2 ) * strideAB2 ), RWORK, oRW + ( ( i + mu - 2 ) * sRW ), WORK, offsetWork + ( ( i + mu - 2 ) * strideWork ), raArr, 0);
						ip = oAB + ( ( ku - mu + 2 ) * sAB1 ) + ( ( i + mu - 3 ) * sAB2 );
						ABv[ ip ] = raV[ 0 ];
						ABv[ ip + 1 ] = raV[ 1 ];

						kumu = Math.min( kl + mu - 2, M - i );
						ipS = oWORK + ( ( i + mu - 2 ) * sWORK );
						svec[ 0 ] = WORKv[ ipS ];
						svec[ 1 ] = WORKv[ ipS + 1 ];
						ipR = oRW + ( ( i + mu - 2 ) * sRW );

						// Zrot with stride 1 (complex elements)
						zrot(kumu, AB, 1, offsetAB + ( ( ku - mu + 3 ) * strideAB1 ) + ( ( i + mu - 3 ) * strideAB2 ), AB, 1, offsetAB + ( ( ku - mu + 2 ) * strideAB1 ) + ( ( i + mu - 2 ) * strideAB2 ), RWORK[ ipR ], svec);
					}
					nr += 1;
					j1 -= kb1;
				}

				if ( wantpt ) {
					// Accumulate right rotations into PT using conj(WORK(j+kun))
					for ( j = j1; j <= j2; j += kb1 ) {
						ipS = oWORK + ( ( j + kun - 1 ) * sWORK );
						svec[ 0 ] = WORKv[ ipS ];
						svec[ 1 ] = -WORKv[ ipS + 1 ]; // conjg
						ipR = oRW + ( ( j + kun - 1 ) * sRW );
						zrot(N, PT, stridePT2, offsetPT + ( ( j + kun - 2 ) * stridePT1 ), PT, stridePT2, offsetPT + ( ( j + kun - 1 ) * stridePT1 ), RWORK[ ipR ], svec);
					}
				}

				if ( j2 + kb > M ) {
					nr -= 1;
					j2 -= kb1;
				}

				// Create nonzero element a(j+kl+ku,j+ku-1) below the band and store it in work
				for ( j = j1; j <= j2; j += kb1 ) {
					// WORK(j+kb) = WORK(j+kun) * AB(klu1, j+kun)
					// AB(klu1, j+kun) = RWORK(j+kun) * AB(klu1, j+kun)
					oi = oAB + ( ( klu1 - 1 ) * sAB1 ) + ( ( j + kun - 1 ) * sAB2 );
					tR = ABv[ oi ];
					tI = ABv[ oi + 1 ];
					ipS = oWORK + ( ( j + kun - 1 ) * sWORK );
					t0 = WORKv[ ipS ];
					t1 = WORKv[ ipS + 1 ];
					ip = oWORK + ( ( j + kb - 1 ) * sWORK );
					WORKv[ ip ] = ( t0 * tR ) - ( t1 * tI );
					WORKv[ ip + 1 ] = ( t0 * tI ) + ( t1 * tR );
					ipR = oRW + ( ( j + kun - 1 ) * sRW );
					ABv[ oi ] = RWORK[ ipR ] * tR;
					ABv[ oi + 1 ] = RWORK[ ipR ] * tI;
				}

				if ( ml > ml0 ) {
					ml -= 1;
				} else {
					mu -= 1;
				}
			}
		}
	}

	if ( ku === 0 && kl > 0 ) {
		// A has been reduced to complex lower bidiagonal form. Transform to real bidiagonal.
		// If M > 1 annihilate subdiagonal elements by plane rotations from the left.
		for ( i = 1; i <= Math.min( M - 1, N ); i++ ) {
			// zlartg( AB(1,i), AB(2,i), rc, rs, ra )
			// Put rc at RWORK[oRW] (single scratch); rs at WORK[offsetWork]
			zlartg( AB, offsetAB + ( ( i - 1 ) * strideAB2 ), AB, offsetAB + strideAB1 + ( ( i - 1 ) * strideAB2 ), RWORK, oRW, WORK, offsetWork, raArr, 0 );

			// AB(1, i) = ra
			ip = oAB + ( ( i - 1 ) * sAB2 );
			ABv[ ip ] = raV[ 0 ];
			ABv[ ip + 1 ] = raV[ 1 ];

			if ( i < N ) {
				// AB(2, i) = rs * AB(1, i+1)
				// AB(1, i+1) = rc * AB(1, i+1)
				oi = oAB + ( i * sAB2 ); // AB(1, i+1)
				tR = ABv[ oi ];
				tI = ABv[ oi + 1 ];

				// Rs (complex) at WORKv[ oWORK ], rc (real) at RWORK[ oRW ]
				ip = oAB + sAB1 + ( ( i - 1 ) * sAB2 ); // AB(2, i)
				ABv[ ip ] = ( WORKv[ oWORK ] * tR ) - ( WORKv[ oWORK + 1 ] * tI );
				ABv[ ip + 1 ] = ( WORKv[ oWORK ] * tI ) + ( WORKv[ oWORK + 1 ] * tR );
				ABv[ oi ] = RWORK[ oRW ] * tR;
				ABv[ oi + 1 ] = RWORK[ oRW ] * tI;
			}

			if ( wantq ) {
				// zrot( M, Q(1,i), 1, Q(1,i+1), 1, rc, conjg(rs) )
				svec[ 0 ] = WORKv[ oWORK ];
				svec[ 1 ] = -WORKv[ oWORK + 1 ];
				zrot(M, Q, strideQ1, offsetQ + ( ( i - 1 ) * strideQ2 ), Q, strideQ1, offsetQ + ( i * strideQ2 ), RWORK[ oRW ], svec);
			}
			if ( wantc ) {
				// zrot( ncc, C(i,1), LDC, C(i+1,1), LDC, rc, rs )
				svec[ 0 ] = WORKv[ oWORK ];
				svec[ 1 ] = WORKv[ oWORK + 1 ];
				zrot(ncc, C, strideC2, offsetC + ( ( i - 1 ) * strideC1 ), C, strideC2, offsetC + ( i * strideC1 ), RWORK[ oRW ], svec);
			}
		}
	} else if ( ku > 0 && M < N ) {
		// A has been reduced to complex upper bidiagonal form or is diagonal.
		// Annihilate the last off-diagonal element of the vector b using rotations from the right.
		// Rb = AB(ku, m+1)
		oi = oAB + ( ( ku - 1 ) * sAB1 ) + ( M * sAB2 );
		rbR = ABv[ oi ];
		rbI = ABv[ oi + 1 ];

		// Use a Complex128Array of length 1 for rb input to zlartg
		rbArr = new Complex128Array( 1 );
		rbV = reinterpret( rbArr, 0 );
		rbV[ 0 ] = rbR;
		rbV[ 1 ] = rbI;

		for ( i = M; i >= 1; i-- ) {
			zlartg(AB, offsetAB + ( ku * strideAB1 ) + ( ( i - 1 ) * strideAB2 ), rbArr, 0, RWORK, oRW, WORK, offsetWork, raArr, 0);

			// AB(ku+1, i) = ra
			ip = oAB + ( ku * sAB1 ) + ( ( i - 1 ) * sAB2 );
			ABv[ ip ] = raV[ 0 ];
			ABv[ ip + 1 ] = raV[ 1 ];

			if ( i > 1 ) {
				// Rb = -conjg(rs) * AB(ku, i)
				// AB(ku, i) = rc * AB(ku, i)
				oi = oAB + ( ( ku - 1 ) * sAB1 ) + ( ( i - 1 ) * sAB2 );
				tR = ABv[ oi ];
				tI = ABv[ oi + 1 ];

				// conjg(rs) = (WORK[0], -WORK[1])

				// -conjg(rs) = (-WORK[0], WORK[1])
				csR = -WORKv[ oWORK ];
				csI = WORKv[ oWORK + 1 ];
				rbV[ 0 ] = ( csR * tR ) - ( csI * tI );
				rbV[ 1 ] = ( csR * tI ) + ( csI * tR );
				ABv[ oi ] = RWORK[ oRW ] * tR;
				ABv[ oi + 1 ] = RWORK[ oRW ] * tI;
			}

			if ( wantpt ) {
				// zrot( N, PT(i,1), LDPT, PT(m+1,1), LDPT, rc, conjg(rs) )
				svec[ 0 ] = WORKv[ oWORK ];
				svec[ 1 ] = -WORKv[ oWORK + 1 ];
				zrot(N, PT, stridePT2, offsetPT + ( ( i - 1 ) * stridePT1 ), PT, stridePT2, offsetPT + ( M * stridePT1 ), RWORK[ oRW ], svec);
			}
		}
	}

	// Make diagonal and superdiagonal elements real, storing them in D and E
	// T = AB(ku+1, 1)
	oi = oAB + ( ku * sAB1 );
	tR = ABv[ oi ];
	tI = ABv[ oi + 1 ];
	for ( i = 1; i <= minmn; i++ ) {
		// abst = abs(t)
		abst = Math.hypot( tR, tI );
		d[ ( ( i - 1 ) * sD ) + offsetD ] = abst;
		if ( abst === 0.0 ) {
			tR = 1.0;
			tI = 0.0;
		} else {
			tR /= abst;
			tI /= abst;
		}
		if ( wantq ) {
			zscal( M, new Complex128( tR, tI ), Q, strideQ1, offsetQ + ( ( i - 1 ) * strideQ2 ) );
		}
		if ( wantc ) {
			// conjg(t)
			zscal( ncc, new Complex128( tR, -tI ), C, strideC2, offsetC + ( ( i - 1 ) * strideC1 ) );
		}
		if ( i < minmn ) {
			if ( ku === 0 && kl === 0 ) {
				e[ ( ( i - 1 ) * sE ) + offsetE ] =0.0;

				// T = AB(1, i+1)
				oi = oAB + ( i * sAB2 );
				tR = ABv[ oi ];
				tI = ABv[ oi + 1 ];
			} else {
				// T = AB(row, col) * conjg(t)
				if ( ku === 0 ) {
					// AB(2, i)
					oi = oAB + sAB1 + ( ( i - 1 ) * sAB2 );
				} else {
					// AB(ku, i+1)
					oi = oAB + ( ( ku - 1 ) * sAB1 ) + ( i * sAB2 );
				}
				// Ab * conjg(t) where conjg(t) = (tR, -tI)
				t0 = ABv[ oi ];
				t1 = ABv[ oi + 1 ];

				// (t0+t1*i)*(tR-tI*i) = (t0*tR + ( t1 * tI )) + ( (t1*tR - ( t0 * tI )) * i )
				newR = ( t0 * tR ) + ( t1 * tI );
				newI = ( t1 * tR ) - ( t0 * tI );
				tR = newR;
				tI = newI;
				abst = Math.hypot( tR, tI );
				e[ ( ( i - 1 ) * sE ) + offsetE ] =abst;
				if ( abst === 0.0 ) {
					tR = 1.0;
					tI = 0.0;
				} else {
					tR /= abst;
					tI /= abst;
				}
				if ( wantpt ) {
					zscal( N, new Complex128( tR, tI ), PT, stridePT2, offsetPT + ( i * stridePT1 ) );
				}
				// T = AB(ku+1, i+1) * conjg(t)
				oi = oAB + ( ku * sAB1 ) + ( i * sAB2 );
				t0 = ABv[ oi ];
				t1 = ABv[ oi + 1 ];
				newR = ( t0 * tR ) + ( t1 * tI );
				newI = ( t1 * tR ) - ( t0 * tI );
				tR = newR;
				tI = newI;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zgbbrd;
