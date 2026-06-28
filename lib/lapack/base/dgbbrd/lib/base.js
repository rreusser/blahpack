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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartg from './../../../../lapack/base/dlartg/lib/base.js';
import dlargv from './../../../../lapack/base/dlargv/lib/base.js';
import dlartv from './../../../../lapack/base/dlartv/lib/base.js';
import dlaset from './../../../../lapack/base/dlaset/lib/base.js';
import drot from './../../../../blas/base/drot/lib/base.js';


// VARIABLES //

var LARTG_OUT = new Float64Array( 3 );


// MAIN //

/**
* Reduces a real general m-by-n band matrix to upper bidiagonal form.
*
* The reduction uses an orthogonal transformation, producing a bidiagonal
* matrix B such that `Q**T * A * P = B`. Optionally forms Q or P**T, or
* computes Q**T*C for a given matrix C.
*
* Band storage: Fortran AB(ku+1+i-j, j) = A(i,j). In the strided JS view,
* the (row r, column c) element (1-based) is
* `AB[offsetAB + (r-1)*strideAB1 + (c-1)*strideAB2]`.
*
* @private
* @param {string} vect - `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} ncc - number of columns of C
* @param {NonNegativeInteger} kl - number of subdiagonals of A
* @param {NonNegativeInteger} ku - number of superdiagonals of A
* @param {Float64Array} AB - band storage of A
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} d - output: diagonal of B
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output: superdiagonal of B
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Q - output: m-by-m orthogonal matrix Q (if requested)
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} PT - output: n-by-n orthogonal matrix P**T (if requested)
* @param {integer} stridePT1 - stride of the first dimension of `PT`
* @param {integer} stridePT2 - stride of the second dimension of `PT`
* @param {NonNegativeInteger} offsetPT - starting index for `PT`
* @param {Float64Array} C - input/output: m-by-ncc matrix overwritten by Q**T*C
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace of length 2*max(M,N)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dgbbrd( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var wantPT;
	var wantB;
	var wantQ;
	var wantC;
	var minmn;
	var klu1;
	var inca;
	var klm;
	var kun;
	var kb1;
	var ml0;
	var mu0;
	var nrt;
	var mn;
	var kb;
	var nr;
	var j1;
	var j2;
	var ml;
	var mu;
	var kk;
	var ra;
	var rb;
	var rc;
	var rs;
	var i;
	var j;
	var l;

	// Fortran AB(row, col) 1-based is indexed as AB[offsetAB + (row-1)*strideAB1 + (col-1)*strideAB2]; WORK(k) is WORK[offsetWork + (k-1)*strideWork].
	wantB = ( vect === 'both' );
	wantQ = ( vect === 'q-only' ) || wantB;
	wantPT = ( vect === 'p-only' ) || wantB;
	wantC = ( ncc > 0 );
	klu1 = kl + ku + 1;

	// Initialize Q and P**T to the identity if requested.
	if ( wantQ ) {
		dlaset( 'all', M, M, 0.0, 1.0, Q, strideQ1, strideQ2, offsetQ );
	}
	if ( wantPT ) {
		dlaset( 'all', N, N, 0.0, 1.0, PT, stridePT1, stridePT2, offsetPT );
	}

	// Quick return.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minmn = Math.min( M, N );

	if ( kl + ku > 1 ) {
		// Reduce to upper bidiagonal form using plane rotations. For each
		// fill-in row/column, apply a generated rotation and chase fills
		// Through the band.

		if ( ku > 0 ) {
			ml0 = 1;
			mu0 = 2;
		} else {
			ml0 = 2;
			mu0 = 1;
		}

		mn = Math.max( M, N );
		klm = Math.min( M - 1, kl );
		kun = Math.min( N - 1, ku );
		kb = klm + kun;
		kb1 = kb + 1;
		inca = kb1 * strideAB1;
		nr = 0;
		j1 = klm + 2;
		j2 = 1 - kun;

		for ( i = 1; i <= minmn; i++ ) {
			ml = klm + 1;
			mu = kun + 1;
			for ( kk = 1; kk <= kb; kk++ ) {
				j1 += kb;
				j2 += kb;

				// Generate plane rotations to annihilate nonzero elements

				// Which have been created below the band.
				if ( nr > 0 ) {
					dlargv( nr, AB, inca, offsetAB + ( (klu1 - 1) * strideAB1 ) + ( (j1 - klm - 2) * strideAB2 ), WORK, kb1 * strideWork, offsetWork + ( (j1 - 1) * strideWork ), WORK, kb1 * strideWork, offsetWork + ( (mn + j1 - 1) * strideWork ) );
				}

				// Apply plane rotations from the left.
				for ( l = 1; l <= kb; l++ ) {
					if ( j2 - klm + l - 1 > N ) {
						nrt = nr - 1;
					} else {
						nrt = nr;
					}
					if ( nrt > 0 ) {
						dlartv( nrt, AB, inca, offsetAB + ( (klu1 - l - 1) * strideAB1 ) + ( (j1 - klm + l - 2) * strideAB2 ), AB, inca, offsetAB + ( (klu1 - l + 1 - 1) * strideAB1 ) + ( (j1 - klm + l - 2) * strideAB2 ), WORK, kb1 * strideWork, offsetWork + ( (mn + j1 - 1) * strideWork ), WORK, kb1 * strideWork, offsetWork + ( (j1 - 1) * strideWork ) );
					}
				}

				if ( ml > ml0 ) {
					if ( ml <= M - i + 1 ) {
						// Generate plane rotation to annihilate a nonzero
						// Element which has been created outside the band.
						dlartg( AB[ offsetAB + ( (ku + ml - 2) * strideAB1 ) + ( (i - 1) * strideAB2 ) ], AB[ offsetAB + ( (ku + ml - 1) * strideAB1 ) + ( (i - 1) * strideAB2 ) ], LARTG_OUT );
						rc = LARTG_OUT[ 0 ];
						rs = LARTG_OUT[ 1 ];
						ra = LARTG_OUT[ 2 ];
						WORK[ offsetWork + ( (mn + i + ml - 2) * strideWork ) ] = rc;
						WORK[ offsetWork + ( (i + ml - 2) * strideWork ) ] = rs;
						AB[ offsetAB + ( (ku + ml - 2) * strideAB1 ) + ( (i - 1) * strideAB2 ) ] = ra;
						if ( i < N ) {
							drot( Math.min( ku + ml - 2, N - i ), AB, strideAB2 - strideAB1, offsetAB + ( (ku + ml - 3) * strideAB1 ) + ( i * strideAB2 ), AB, strideAB2 - strideAB1, offsetAB + ( (ku + ml - 2) * strideAB1 ) + ( i * strideAB2 ), WORK[ offsetWork + ( (mn + i + ml - 2) * strideWork ) ], WORK[ offsetWork + ( (i + ml - 2) * strideWork ) ] );
						}
					}
					nr += 1;
					j1 -= kb1;
				}

				if ( wantQ ) {
					// Accumulate product of plane rotations in Q.
					for ( j = j1; j <= j2; j += kb1 ) {
						drot( M, Q, strideQ1, offsetQ + ( (j - 2) * strideQ2 ), Q, strideQ1, offsetQ + ( (j - 1) * strideQ2 ), WORK[ offsetWork + ( (mn + j - 1) * strideWork ) ], WORK[ offsetWork + ( (j - 1) * strideWork ) ] );
					}
				}

				if ( wantC ) {
					// Apply plane rotations to C.
					for ( j = j1; j <= j2; j += kb1 ) {
						drot( ncc, C, strideC2, offsetC + ( (j - 2) * strideC1 ), C, strideC2, offsetC + ( (j - 1) * strideC1 ), WORK[ offsetWork + ( (mn + j - 1) * strideWork ) ], WORK[ offsetWork + ( (j - 1) * strideWork ) ] );
					}
				}

				if ( j2 + kun > N ) {
					// Adjust J2 to keep within the bounds of the matrix.
					nr -= 1;
					j2 -= kb1;
				}

				for ( j = j1; j <= j2; j += kb1 ) {
					// Create nonzero element A(J-1,J+KU) above the band and
					// Store it in WORK(N+1:2*N).
					WORK[ offsetWork + ( (j + kun - 1) * strideWork ) ] = WORK[ offsetWork + ( (j - 1) * strideWork ) ] * AB[ offsetAB + ( (j + kun - 1) * strideAB2 ) ];
					AB[ offsetAB + ( (j + kun - 1) * strideAB2 ) ] = WORK[ offsetWork + ( (mn + j - 1) * strideWork ) ] * AB[ offsetAB + ( (j + kun - 1) * strideAB2 ) ];
				}

				// Generate plane rotations to annihilate nonzero elements
				// Which have been generated above the band.
				if ( nr > 0 ) {
					dlargv( nr, AB, inca, offsetAB + ( (j1 + kun - 2) * strideAB2 ), WORK, kb1 * strideWork, offsetWork + ( (j1 + kun - 1) * strideWork ), WORK, kb1 * strideWork, offsetWork + ( (mn + j1 + kun - 1) * strideWork ) );
				}

				// Apply plane rotations from the right.
				for ( l = 1; l <= kb; l++ ) {
					if ( j2 + l - 1 > M ) {
						nrt = nr - 1;
					} else {
						nrt = nr;
					}
					if ( nrt > 0 ) {
						dlartv( nrt, AB, inca, offsetAB + ( l * strideAB1 ) + ( (j1 + kun - 2) * strideAB2 ), AB, inca, offsetAB + ( (l - 1) * strideAB1 ) + ( (j1 + kun - 1) * strideAB2 ), WORK, kb1 * strideWork, offsetWork + ( (mn + j1 + kun - 1) * strideWork ), WORK, kb1 * strideWork, offsetWork + ( (j1 + kun - 1) * strideWork ) );
					}
				}

				if ( ml === ml0 && mu > mu0 ) {
					if ( mu <= N - i + 1 ) {
						// Generate plane rotation to annihilate a nonzero
						// Element which has been created outside the band.
						dlartg( AB[ offsetAB + ( (ku - mu + 2) * strideAB1 ) + ( (i + mu - 3) * strideAB2 ) ], AB[ offsetAB + ( (ku - mu + 1) * strideAB1 ) + ( (i + mu - 2) * strideAB2 ) ], LARTG_OUT );
						rc = LARTG_OUT[ 0 ];
						rs = LARTG_OUT[ 1 ];
						ra = LARTG_OUT[ 2 ];
						WORK[ offsetWork + ( (mn + i + mu - 2) * strideWork ) ] = rc;
						WORK[ offsetWork + ( (i + mu - 2) * strideWork ) ] = rs;
						AB[ offsetAB + ( (ku - mu + 2) * strideAB1 ) + ( (i + mu - 3) * strideAB2 ) ] = ra;
						drot( Math.min( kl + mu - 2, M - i ), AB, strideAB1, offsetAB + ( (ku - mu + 3) * strideAB1 ) + ( (i + mu - 3) * strideAB2 ), AB, strideAB1, offsetAB + ( (ku - mu + 2) * strideAB1 ) + ( (i + mu - 2) * strideAB2 ), WORK[ offsetWork + ( (mn + i + mu - 2) * strideWork ) ], WORK[ offsetWork + ( (i + mu - 2) * strideWork ) ] );
					}
					nr += 1;
					j1 -= kb1;
				}

				if ( wantPT ) {
					// Accumulate product of plane rotations in P**T.
					for ( j = j1; j <= j2; j += kb1 ) {
						drot( N, PT, stridePT2, offsetPT + ( (j + kun - 2) * stridePT1 ), PT, stridePT2, offsetPT + ( (j + kun - 1) * stridePT1 ), WORK[ offsetWork + ( (mn + j + kun - 1) * strideWork ) ], WORK[ offsetWork + ( (j + kun - 1) * strideWork ) ] );
					}
				}

				if ( j2 + kb > M ) {
					// Adjust J2 to keep within the bounds of the matrix.
					nr -= 1;
					j2 -= kb1;
				}

				for ( j = j1; j <= j2; j += kb1 ) {
					// Create nonzero element a(j+kl+ku,j+ku-1) below the
					// Band and store it in WORK(1:n).
					WORK[ offsetWork + ( (j + kb - 1) * strideWork ) ] = WORK[ offsetWork + ( (j + kun - 1) * strideWork ) ] * AB[ offsetAB + ( (klu1 - 1) * strideAB1 ) + ( (j + kun - 1) * strideAB2 ) ];
					AB[ offsetAB + ( (klu1 - 1) * strideAB1 ) + ( (j + kun - 1) * strideAB2 ) ] = WORK[ offsetWork + ( (mn + j + kun - 1) * strideWork ) ] * AB[ offsetAB + ( (klu1 - 1) * strideAB1 ) + ( (j + kun - 1) * strideAB2 ) ];
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
		// A has been reduced to lower bidiagonal form. Transform to upper
		// Bidiagonal using Givens rotations.
		for ( i = 1; i <= Math.min( M - 1, N ); i++ ) {
			dlartg( AB[ offsetAB + ( (i - 1) * strideAB2 ) ], AB[ offsetAB + strideAB1 + ( (i - 1) * strideAB2 ) ], LARTG_OUT );
			rc = LARTG_OUT[ 0 ];
			rs = LARTG_OUT[ 1 ];
			ra = LARTG_OUT[ 2 ];
			d[ offsetD + ( (i - 1) * strideD ) ] = ra;
			if ( i < N ) {
				e[ offsetE + ( (i - 1) * strideE ) ] = rs * AB[ offsetAB + ( i * strideAB2 ) ];
				AB[ offsetAB + ( i * strideAB2 ) ] = rc * AB[ offsetAB + ( i * strideAB2 ) ];
			}
			if ( wantQ ) {
				drot( M, Q, strideQ1, offsetQ + ( (i - 1) * strideQ2 ), Q, strideQ1, offsetQ + ( i * strideQ2 ), rc, rs );
			}
			if ( wantC ) {
				drot( ncc, C, strideC2, offsetC + ( (i - 1) * strideC1 ), C, strideC2, offsetC + ( i * strideC1 ), rc, rs );
			}
		}
		if ( M <= N ) {
			d[ offsetD + ( (M - 1) * strideD ) ] = AB[ offsetAB + ( (M - 1) * strideAB2 ) ];
		}
	} else if ( ku > 0 ) {
		// A has been reduced to upper bidiagonal form. If M < N, we still
		// Need to zero out superdiagonal element in column m+1.
		if ( M < N ) {
			rb = AB[ offsetAB + ( (ku - 1) * strideAB1 ) + ( M * strideAB2 ) ];
			for ( i = M; i >= 1; i-- ) {
				dlartg( AB[ offsetAB + ( ku * strideAB1 ) + ( (i - 1) * strideAB2 ) ], rb, LARTG_OUT );
				rc = LARTG_OUT[ 0 ];
				rs = LARTG_OUT[ 1 ];
				ra = LARTG_OUT[ 2 ];
				d[ offsetD + ( (i - 1) * strideD ) ] = ra;
				if ( i > 1 ) {
					rb = -rs * AB[ offsetAB + ( (ku - 1) * strideAB1 ) + ( (i - 1) * strideAB2 ) ];
					e[ offsetE + ( (i - 2) * strideE ) ] = rc * AB[ offsetAB + ( (ku - 1) * strideAB1 ) + ( (i - 1) * strideAB2 ) ];
				}
				if ( wantPT ) {
					drot( N, PT, stridePT2, offsetPT + ( (i - 1) * stridePT1 ), PT, stridePT2, offsetPT + ( M * stridePT1 ), rc, rs );
				}
			}
		} else {
			// Copy off-diagonal elements to E and diagonal elements to D.
			for ( i = 1; i <= minmn - 1; i++ ) {
				e[ offsetE + ( (i - 1) * strideE ) ] = AB[ offsetAB + ( (ku - 1) * strideAB1 ) + ( i * strideAB2 ) ];
			}
			for ( i = 1; i <= minmn; i++ ) {
				d[ offsetD + ( (i - 1) * strideD ) ] = AB[ offsetAB + ( ku * strideAB1 ) + ( (i - 1) * strideAB2 ) ];
			}
		}
	} else {
		// A is diagonal. Set E and D from the only diagonal of AB.
		for ( i = 1; i <= minmn - 1; i++ ) {
			e[ offsetE + ( (i - 1) * strideE ) ] = 0.0;
		}
		for ( i = 1; i <= minmn; i++ ) {
			d[ offsetD + ( (i - 1) * strideD ) ] = AB[ offsetAB + ( (i - 1) * strideAB2 ) ];
		}
	}

	return 0;
}


// EXPORTS //

export default dgbbrd;
