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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-mixed-operators */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlar2v from '../../dlar2v/lib/base.js';
import dlargv from '../../dlargv/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlartv from '../../dlartv/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';


// VARIABLES //

var rot = new Float64Array( 3 ); // scratch for dlartg output: [c, s, r]


// MAIN //

/**
* Reduces a real symmetric band matrix to tridiagonal form by orthogonal similarity transformation.
*
* The cosines and sines of the plane rotations are temporarily stored in
* the arrays d and WORK during the reduction, then the tridiagonal
* elements are extracted from AB at the end.
*
* @private
* @param {string} vect - `'none'`: do not form Q; `'initialize'`: form Q (start from identity); `'update'`: update an existing matrix Q
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Float64Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB`
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Q - orthogonal matrix (N-by-N)
* @param {integer} strideQ1 - stride of the first (row) dimension of `Q`
* @param {integer} strideQ2 - stride of the second (column) dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} WORK - workspace array (length N)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dsbtrd( vect, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK ) {
	var iqaend;
	var j1end;
	var initq;
	var iqend;
	var wantq;
	var upper;
	var inca;
	var incx;
	var jend;
	var jinc;
	var last;
	var lend;
	var temp;
	var kdm1;
	var ibl;
	var iqb;
	var kd1;
	var kdn;
	var nrt;
	var nr;
	var nq;
	var i2;
	var j1;
	var j2;
	var i;
	var j;
	var k;
	var l;

	initq = ( vect === 'initialize' );
	wantq = initq || ( vect === 'update' );
	upper = ( uplo === 'upper' );
	kd1 = kd + 1;
	kdm1 = kd - 1;
	incx = strideAB2 - strideAB1; // Fortran: LDAB - 1
	iqend = 1; // 1-based, used in INITQ tracking

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	// Initialize Q to the unit matrix, if needed:
	if ( initq ) {
		dlaset( 'full', N, N, 0.0, 1.0, Q, strideQ1, strideQ2, offsetQ );
	}

	// INCA = KD1 * LDAB: stride to move KD1 columns in AB
	inca = kd1 * strideAB2;

	kdn = Math.min( N - 1, kd );

	if ( upper ) {
		if ( kd > 1 ) {
			// Reduce to tridiagonal form, working with upper triangle.
			nr = 0;
			j1 = kdn + 2; // 1-based Fortran index
			j2 = 1;        // 1-based

			for ( i = 1; i <= N - 2; i++ ) {
				// Reduce i-th row of matrix to tridiagonal form.
				for ( k = kdn + 1; k >= 2; k-- ) {
					j1 += kdn;
					j2 += kdn;

					if ( nr > 0 ) {
						// Generate plane rotations to annihilate nonzero
						// Elements which have been created outside the band.

						// Fortran: DLARGV( NR, AB(1, J1-1), INCA, WORK(J1), KD1, D(J1), KD1 )
						// AB(1, J1-1) -> offset + 0*sAB1 + (J1-2)*sAB2
						dlargv( nr, AB, inca, offsetAB + ( j1 - 2 ) * strideAB2, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD);

						// Apply rotations from the right.
						if ( nr >= ( 2 * kd ) - 1 ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								// Fortran: DLARTV( NR, AB(L+1, J1-1), INCA, AB(L, J1), INCA, D(J1), WORK(J1), KD1 )
								dlartv( nr, AB, inca, offsetAB + l * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + ( l - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK);
							}
						} else {
							jend = j1 + ( ( nr - 1 ) * kd1 );
							for ( jinc = j1; jinc <= jend; jinc += kd1 ) {
								// Fortran: DROT( KDM1, AB(2, JINC-1), 1, AB(1, JINC), 1, D(JINC), WORK(JINC) )
								drot( kdm1, AB, strideAB1, offsetAB + strideAB1 + ( jinc - 2 ) * strideAB2, AB, strideAB1, offsetAB + ( jinc - 1 ) * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], WORK[ offsetWORK + ( jinc - 1 ) * strideWORK ]);
							}
						}
					}

					if ( k > 2 ) {
						if ( k <= N - i + 1 ) {
							// Generate plane rotation to annihilate a(i,i+k-1) within the band.
							// Fortran: DLARTG( AB(KD-K+3, I+K-2), AB(KD-K+2, I+K-1), D(I+K-1), WORK(I+K-1), TEMP )
							dlartg(AB[ offsetAB + ( kd - k + 2 ) * strideAB1 + ( i + k - 3 ) * strideAB2 ], AB[ offsetAB + ( kd - k + 1 ) * strideAB1 + ( i + k - 2 ) * strideAB2 ], rot);
							d[ offsetD + ( i + k - 2 ) * strideD ] = rot[ 0 ];
							WORK[ offsetWORK + ( i + k - 2 ) * strideWORK ] = rot[ 1 ];
							temp = rot[ 2 ];
							AB[ offsetAB + ( kd - k + 2 ) * strideAB1 + ( i + k - 3 ) * strideAB2 ] = temp;

							// Apply rotation from the right.

							// Fortran: DROT( K-3, AB(KD-K+4, I+K-2), 1, AB(KD-K+3, I+K-1), 1, D(I+K-1), WORK(I+K-1) )
							drot( k - 3, AB, strideAB1, offsetAB + ( kd - k + 3 ) * strideAB1 + ( i + k - 3 ) * strideAB2, AB, strideAB1, offsetAB + ( kd - k + 2 ) * strideAB1 + ( i + k - 2 ) * strideAB2, d[ offsetD + ( i + k - 2 ) * strideD ], WORK[ offsetWORK + ( i + k - 2 ) * strideWORK ]);
						}
						nr += 1;
						j1 -= kdn + 1;
					}

					// Apply plane rotations from both sides to diagonal blocks.
					if ( nr > 0 ) {
						// Fortran: DLAR2V( NR, AB(KD1, J1-1), AB(KD1, J1), AB(KD, J1), INCA, D(J1), WORK(J1), KD1 )
						dlar2v( nr, AB, inca, offsetAB + kd * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + kd * strideAB1 + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( kd - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK);
					}

					// Apply plane rotations from the left.
					if ( nr > 0 ) {
						if ( ( 2 * kd ) - 1 < nr ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								if ( j2 + l > N ) {
									nrt = nr - 1;
								} else {
									nrt = nr;
								}
								if ( nrt > 0 ) {
									// Fortran: DLARTV( NRT, AB(KD-L, J1+L), INCA, AB(KD-L+1, J1+L), INCA, D(J1), WORK(J1), KD1 )
									dlartv( nrt, AB, inca, offsetAB + ( kd - l - 1 ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( kd - l ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK);
								}
							}
						} else {
							j1end = j1 + ( kd1 * ( nr - 2 ) );
							if ( j1end >= j1 ) {
								for ( jinc = j1; jinc <= j1end; jinc += kd1 ) {
									// Fortran: DROT( KD-1, AB(KD-1, JIN+1), INCX, AB(KD, JIN+1), INCX, D(JIN), WORK(JIN) )
									drot( kd - 1, AB, incx, offsetAB + ( kd - 2 ) * strideAB1 + jinc * strideAB2, AB, incx, offsetAB + ( kd - 1 ) * strideAB1 + jinc * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], WORK[ offsetWORK + ( jinc - 1 ) * strideWORK ]);
								}
							}
							lend = Math.min( kdm1, N - j2 );
							last = j1end + kd1;
							if ( lend > 0 ) {
								// Fortran: DROT( LEND, AB(KD-1, LAST+1), INCX, AB(KD, LAST+1), INCX, D(LAST), WORK(LAST) )
								drot( lend, AB, incx, offsetAB + ( kd - 2 ) * strideAB1 + last * strideAB2, AB, incx, offsetAB + ( kd - 1 ) * strideAB1 + last * strideAB2, d[ offsetD + ( last - 1 ) * strideD ], WORK[ offsetWORK + ( last - 1 ) * strideWORK ]);
							}
						}
					}

					if ( wantq ) {
						// Accumulate product of plane rotations in Q.
						if ( initq ) {
							iqend = Math.max( iqend, j2 );
							i2 = Math.max( 0, k - 3 );
							iqaend = 1 + ( i * kd ); // 1-based
							if ( k === 2 ) {
								iqaend += kd;
							}
							iqaend = Math.min( iqaend, iqend );
							for ( j = j1; j <= j2; j += kd1 ) {
								ibl = i - Math.floor( i2 / kdm1 );
								i2 += 1;
								iqb = Math.max( 1, j - ibl ); // 1-based
								nq = 1 + iqaend - iqb;
								iqaend = Math.min( iqaend + kd, iqend );

								// Fortran: DROT( NQ, Q(IQB, J-1), 1, Q(IQB, J), 1, D(J), WORK(J) )
								drot( nq, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], WORK[ offsetWORK + ( j - 1 ) * strideWORK ]);
							}
						} else {
							for ( j = j1; j <= j2; j += kd1 ) {
								// Fortran: DROT( N, Q(1, J-1), 1, Q(1, J), 1, D(J), WORK(J) )
								drot( N, Q, strideQ1, offsetQ + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], WORK[ offsetWORK + ( j - 1 ) * strideWORK ]);
							}
						}
					}

					if ( j2 + kdn > N ) {
						// Adjust J2 to keep within the bounds of the matrix.
						nr -= 1;
						j2 -= kdn + 1;
					}

					for ( j = j1; j <= j2; j += kd1 ) {
						// Create nonzero element a(j-1,j+kd) outside the band and store it in WORK.
						// Fortran: WORK(J+KD) = WORK(J) * AB(1, J+KD)
						WORK[ offsetWORK + ( j + kd - 1 ) * strideWORK ] = WORK[ offsetWORK + ( j - 1 ) * strideWORK ] * AB[ offsetAB + ( j + kd - 1 ) * strideAB2 ];

						// Fortran: AB(1, J+KD) = D(J) * AB(1, J+KD)
						AB[ offsetAB + ( j + kd - 1 ) * strideAB2 ] = d[ offsetD + ( j - 1 ) * strideD ] * AB[ offsetAB + ( j + kd - 1 ) * strideAB2 ];
					}
				}
			}
		}

		if ( kd > 0 ) {
			// Copy off-diagonal elements to E.
			// Fortran: E(I) = AB(KD, I+1) for I = 1..N-1
			for ( i = 1; i <= N - 1; i++ ) {
				e[ offsetE + ( i - 1 ) * strideE ] = AB[ offsetAB + ( kd - 1 ) * strideAB1 + i * strideAB2 ];
			}
		} else {
			// Set E to zero if original matrix was diagonal.
			for ( i = 1; i <= N - 1; i++ ) {
				e[ offsetE + ( i - 1 ) * strideE ] = 0.0;
			}
		}

		// Copy diagonal elements to D.
		// Fortran: D(I) = AB(KD1, I) for I = 1..N
		for ( i = 1; i <= N; i++ ) {
			d[ offsetD + ( i - 1 ) * strideD ] = AB[ offsetAB + kd * strideAB1 + ( i - 1 ) * strideAB2 ];
		}
	} else {
		// Lower triangle case.
		if ( kd > 1 ) {
			// Reduce to tridiagonal form, working with lower triangle.
			nr = 0;
			j1 = kdn + 2; // 1-based
			j2 = 1;

			for ( i = 1; i <= N - 2; i++ ) {
				// Reduce i-th column of matrix to tridiagonal form.
				for ( k = kdn + 1; k >= 2; k-- ) {
					j1 += kdn;
					j2 += kdn;

					if ( nr > 0 ) {
						// Generate plane rotations to annihilate nonzero
						// Elements which have been created outside the band.

						// Fortran: DLARGV( NR, AB(KD1, J1-KD1), INCA, WORK(J1), KD1, D(J1), KD1 )
						dlargv( nr, AB, inca, offsetAB + kd * strideAB1 + ( j1 - kd1 - 1 ) * strideAB2, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD);

						// Apply plane rotations from one side.
						if ( nr > ( 2 * kd ) - 1 ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								// Fortran: DLARTV( NR, AB(KD1-L, J1-KD1+L), INCA, AB(KD1-L+1, J1-KD1+L), INCA, D(J1), WORK(J1), KD1 )
								dlartv( nr, AB, inca, offsetAB + ( kd - l ) * strideAB1 + ( j1 - kd1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( kd - l + 1 ) * strideAB1 + ( j1 - kd1 + l - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK);
							}
						} else {
							jend = j1 + ( kd1 * ( nr - 1 ) );
							for ( jinc = j1; jinc <= jend; jinc += kd1 ) {
								// Fortran: DROT( KDM1, AB(KD, JINC-KD), INCX, AB(KD1, JINC-KD), INCX, D(JINC), WORK(JINC) )
								drot( kdm1, AB, incx, offsetAB + ( kd - 1 ) * strideAB1 + ( jinc - kd - 1 ) * strideAB2, AB, incx, offsetAB + kd * strideAB1 + ( jinc - kd - 1 ) * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], WORK[ offsetWORK + ( jinc - 1 ) * strideWORK ]);
							}
						}
					}

					if ( k > 2 ) {
						if ( k <= N - i + 1 ) {
							// Generate plane rotation to annihilate a(i+k-1,i) within the band.
							// Fortran: DLARTG( AB(K-1, I), AB(K, I), D(I+K-1), WORK(I+K-1), TEMP )
							dlartg(AB[ offsetAB + ( k - 2 ) * strideAB1 + ( i - 1 ) * strideAB2 ], AB[ offsetAB + ( k - 1 ) * strideAB1 + ( i - 1 ) * strideAB2 ], rot);
							d[ offsetD + ( i + k - 2 ) * strideD ] = rot[ 0 ];
							WORK[ offsetWORK + ( i + k - 2 ) * strideWORK ] = rot[ 1 ];
							temp = rot[ 2 ];
							AB[ offsetAB + ( k - 2 ) * strideAB1 + ( i - 1 ) * strideAB2 ] = temp;

							// Apply rotation from the left.

							// Fortran: DROT( K-3, AB(K-2, I+1), LDAB-1, AB(K-1, I+1), LDAB-1, D(I+K-1), WORK(I+K-1) )
							drot( k - 3, AB, incx, offsetAB + ( k - 3 ) * strideAB1 + i * strideAB2, AB, incx, offsetAB + ( k - 2 ) * strideAB1 + i * strideAB2, d[ offsetD + ( i + k - 2 ) * strideD ], WORK[ offsetWORK + ( i + k - 2 ) * strideWORK ]);
						}
						nr += 1;
						j1 -= kdn + 1;
					}

					// Apply plane rotations from both sides to diagonal blocks.
					if ( nr > 0 ) {
						// Fortran: DLAR2V( NR, AB(1, J1-1), AB(1, J1), AB(2, J1-1), INCA, D(J1), WORK(J1), KD1 )
						dlar2v( nr, AB, inca, offsetAB + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + strideAB1 + ( j1 - 2 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK);
					}

					// Apply plane rotations from the right.
					if ( nr > 0 ) {
						if ( nr > ( 2 * kd ) - 1 ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								if ( j2 + l > N ) {
									nrt = nr - 1;
								} else {
									nrt = nr;
								}
								if ( nrt > 0 ) {
									// Fortran: DLARTV( NRT, AB(L+2, J1-1), INCA, AB(L+1, J1), INCA, D(J1), WORK(J1), KD1 )
									dlartv( nrt, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + l * strideAB1 + ( j1 - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWORK, offsetWORK + ( j1 - 1 ) * strideWORK);
								}
							}
						} else {
							j1end = j1 + ( kd1 * ( nr - 2 ) );
							if ( j1end >= j1 ) {
								for ( jinc = j1; jinc <= j1end; jinc += kd1 ) {
									// Fortran: DROT( KDM1, AB(3, J1INC-1), 1, AB(2, J1INC), 1, D(J1INC), WORK(J1INC) )
									drot( kdm1, AB, strideAB1, offsetAB + 2 * strideAB1 + ( jinc - 2 ) * strideAB2, AB, strideAB1, offsetAB + strideAB1 + ( jinc - 1 ) * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], WORK[ offsetWORK + ( jinc - 1 ) * strideWORK ]);
								}
							}
							lend = Math.min( kdm1, N - j2 );
							last = j1end + kd1;
							if ( lend > 0 ) {
								// Fortran: DROT( LEND, AB(3, LAST-1), 1, AB(2, LAST), 1, D(LAST), WORK(LAST) )
								drot( lend, AB, strideAB1, offsetAB + 2 * strideAB1 + ( last - 2 ) * strideAB2, AB, strideAB1, offsetAB + strideAB1 + ( last - 1 ) * strideAB2, d[ offsetD + ( last - 1 ) * strideD ], WORK[ offsetWORK + ( last - 1 ) * strideWORK ]);
							}
						}
					}

					if ( wantq ) {
						// Accumulate product of plane rotations in Q.
						if ( initq ) {
							iqend = Math.max( iqend, j2 );
							i2 = Math.max( 0, k - 3 );
							iqaend = 1 + ( i * kd ); // 1-based
							if ( k === 2 ) {
								iqaend += kd;
							}
							iqaend = Math.min( iqaend, iqend );
							for ( j = j1; j <= j2; j += kd1 ) {
								ibl = i - Math.floor( i2 / kdm1 );
								i2 += 1;
								iqb = Math.max( 1, j - ibl ); // 1-based
								nq = 1 + iqaend - iqb;
								iqaend = Math.min( iqaend + kd, iqend );

								// Fortran: DROT( NQ, Q(IQB, J-1), 1, Q(IQB, J), 1, D(J), WORK(J) )
								drot( nq, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], WORK[ offsetWORK + ( j - 1 ) * strideWORK ]);
							}
						} else {
							for ( j = j1; j <= j2; j += kd1 ) {
								// Fortran: DROT( N, Q(1, J-1), 1, Q(1, J), 1, D(J), WORK(J) )
								drot( N, Q, strideQ1, offsetQ + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], WORK[ offsetWORK + ( j - 1 ) * strideWORK ]);
							}
						}
					}

					if ( j2 + kdn > N ) {
						// Adjust J2 to keep within the bounds of the matrix.
						nr -= 1;
						j2 -= kdn + 1;
					}

					for ( j = j1; j <= j2; j += kd1 ) {
						// Create nonzero element a(j+kd,j-1) outside the band and store it in WORK.
						// Fortran: WORK(J+KD) = WORK(J) * AB(KD1, J)
						WORK[ offsetWORK + ( j + kd - 1 ) * strideWORK ] = WORK[ offsetWORK + ( j - 1 ) * strideWORK ] * AB[ offsetAB + kd * strideAB1 + ( j - 1 ) * strideAB2 ];

						// Fortran: AB(KD1, J) = D(J) * AB(KD1, J)
						AB[ offsetAB + kd * strideAB1 + ( j - 1 ) * strideAB2 ] = d[ offsetD + ( j - 1 ) * strideD ] * AB[ offsetAB + kd * strideAB1 + ( j - 1 ) * strideAB2 ];
					}
				}
			}
		}

		if ( kd > 0 ) {
			// Copy off-diagonal elements to E.
			// Fortran: E(I) = AB(2, I) for I = 1..N-1
			for ( i = 1; i <= N - 1; i++ ) {
				e[ offsetE + ( i - 1 ) * strideE ] = AB[ offsetAB + strideAB1 + ( i - 1 ) * strideAB2 ];
			}
		} else {
			// Set E to zero if original matrix was diagonal.
			for ( i = 1; i <= N - 1; i++ ) {
				e[ offsetE + ( i - 1 ) * strideE ] = 0.0;
			}
		}

		// Copy diagonal elements to D.
		// Fortran: D(I) = AB(1, I) for I = 1..N
		for ( i = 1; i <= N; i++ ) {
			d[ offsetD + ( i - 1 ) * strideD ] = AB[ offsetAB + ( i - 1 ) * strideAB2 ];
		}
	}

	return 0;
}


// EXPORTS //

export default dsbtrd;
