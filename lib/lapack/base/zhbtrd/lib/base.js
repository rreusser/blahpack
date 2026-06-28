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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlar2v from '../../zlar2v/lib/base.js';
import zlargv from '../../zlargv/lib/base.js';
import zlartg from '../../zlartg/lib/base.js';
import zlartv from '../../zlartv/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zrot from '../../zrot/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var tempArr = new Complex128Array( 1 ); // scratch for zlartg result r
var tempv = reinterpret( tempArr, 0 );
var sn = new Float64Array( 2 );        // scratch for zrot sine argument
var conjSn = new Float64Array( 2 );    // scratch for conjugated sine


// MAIN //

/**
* Reduces a complex Hermitian band matrix to real tridiagonal form by unitary similarity transformation.
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
* @param {Complex128Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} Q - unitary matrix (N-by-N)
* @param {integer} strideQ1 - stride of the first (row) dimension of `Q` (in complex elements)
* @param {integer} strideQ2 - stride of the second (column) dimension of `Q` (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (in complex elements)
* @param {Complex128Array} WORK - workspace array (length N)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zhbtrd( vect, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork ) {
	var iqaend;
	var j1end;
	var initq;
	var iqend;
	var wantq;
	var upper;
	var WORKv;
	var inca;
	var incx;
	var jend;
	var jinc;
	var last;
	var lend;
	var abst;
	var kdm1;
	var ABv;
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
	var tr;
	var ti;
	var wr;
	var wi;
	var i;
	var j;
	var k;
	var l;
	var p;

	initq = ( vect === 'initialize' );
	wantq = initq || ( vect === 'update' );
	upper = ( uplo === 'upper' );
	kd1 = kd + 1;
	kdm1 = kd - 1;
	incx = strideAB2 - strideAB1; // Fortran: LDAB - 1 (in complex elements)
	iqend = 1; // 1-based, used in INITQ tracking

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	// Initialize Q to the unit matrix, if needed:
	if ( initq ) {
		zlaset( 'full', N, N, CZERO, CONE, Q, strideQ1, strideQ2, offsetQ );
	}

	// Reinterpret complex arrays as Float64 for element access:
	ABv = reinterpret( AB, 0 );
	WORKv = reinterpret( WORK, 0 );

	// INCA = KD1 * LDAB: stride to move KD1 columns in AB (in complex elements)
	inca = kd1 * strideAB2;

	kdn = Math.min( N - 1, kd );

	if ( upper ) {
		if ( kd > 1 ) {
			// Reduce to complex Hermitian tridiagonal form, working with upper triangle.
			nr = 0;
			j1 = kdn + 2; // 1-based Fortran index
			j2 = 1;        // 1-based

			// Force diagonal real: AB(KD1, 1) = DBLE(AB(KD1, 1))
			p = ( offsetAB + kd * strideAB1 ) * 2;
			ABv[ p + 1 ] = 0.0;

			for ( i = 1; i <= N - 2; i++ ) {
				// Reduce i-th row of matrix to tridiagonal form.
				for ( k = kdn + 1; k >= 2; k-- ) {
					j1 += kdn;
					j2 += kdn;

					if ( nr > 0 ) {
						// Generate plane rotations to annihilate nonzero elements
						// Which have been created outside the band.

						// Fortran: ZLARGV( NR, AB(1, J1-1), INCA, WORK(J1), KD1, D(J1), KD1 )
						zlargv( nr, AB, inca, offsetAB + ( j1 - 2 ) * strideAB2, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD );

						// Apply rotations from the right.
						if ( nr >= ( 2 * kd ) - 1 ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								// Fortran: ZLARTV( NR, AB(L+1, J1-1), INCA, AB(L, J1), INCA, D(J1), WORK(J1), KD1 )
								zlartv( nr, AB, inca, offsetAB + l * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + ( l - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
							}
						} else {
							jend = j1 + ( ( nr - 1 ) * kd1 );
							for ( jinc = j1; jinc <= jend; jinc += kd1 ) {
								// Fortran: ZROT( KDM1, AB(2, JINC-1), 1, AB(1, JINC), 1, D(JINC), WORK(JINC) )
								p = ( offsetWork + ( jinc - 1 ) * strideWork ) * 2;
								sn[ 0 ] = WORKv[ p ];
								sn[ 1 ] = WORKv[ p + 1 ];
								zrot( kdm1, AB, strideAB1, offsetAB + strideAB1 + ( jinc - 2 ) * strideAB2, AB, strideAB1, offsetAB + ( jinc - 1 ) * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], sn );
							}
						}
					}

					if ( k > 2 ) {
						if ( k <= N - i + 1 ) {
							// Generate plane rotation to annihilate a(i,i+k-1) within the band.
							// Fortran: ZLARTG( AB(KD-K+3, I+K-2), AB(KD-K+2, I+K-1), D(I+K-1), WORK(I+K-1), TEMP )
							zlartg( AB, offsetAB + ( kd - k + 2 ) * strideAB1 + ( i + k - 3 ) * strideAB2, AB, offsetAB + ( kd - k + 1 ) * strideAB1 + ( i + k - 2 ) * strideAB2, d, offsetD + ( i + k - 2 ) * strideD, WORK, offsetWork + ( i + k - 2 ) * strideWork, tempArr, 0 );

							// AB(KD-K+3, I+K-2) = TEMP
							p = ( offsetAB + ( kd - k + 2 ) * strideAB1 + ( i + k - 3 ) * strideAB2 ) * 2;
							ABv[ p ] = tempv[ 0 ];
							ABv[ p + 1 ] = tempv[ 1 ];

							// Apply rotation from the right.

							// Fortran: ZROT( K-3, AB(KD-K+4, I+K-2), 1, AB(KD-K+3, I+K-1), 1, D(I+K-1), WORK(I+K-1) )
							p = ( offsetWork + ( i + k - 2 ) * strideWork ) * 2;
							sn[ 0 ] = WORKv[ p ];
							sn[ 1 ] = WORKv[ p + 1 ];
							zrot( k - 3, AB, strideAB1, offsetAB + ( kd - k + 3 ) * strideAB1 + ( i + k - 3 ) * strideAB2, AB, strideAB1, offsetAB + ( kd - k + 2 ) * strideAB1 + ( i + k - 2 ) * strideAB2, d[ offsetD + ( i + k - 2 ) * strideD ], sn );
						}
						nr += 1;
						j1 -= kdn + 1;
					}

					// Apply plane rotations from both sides to diagonal blocks.
					if ( nr > 0 ) {
						// Fortran: ZLAR2V( NR, AB(KD1, J1-1), AB(KD1, J1), AB(KD, J1), INCA, D(J1), WORK(J1), KD1 )
						zlar2v( nr, AB, inca, offsetAB + kd * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + kd * strideAB1 + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + ( kd - 1 ) * strideAB1 + ( j1 - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
					}

					// Apply plane rotations from the left.
					if ( nr > 0 ) {
						zlacgv( nr, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
						if ( ( 2 * kd ) - 1 < nr ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								if ( j2 + l > N ) {
									nrt = nr - 1;
								} else {
									nrt = nr;
								}
								if ( nrt > 0 ) {
									// Fortran: ZLARTV( NRT, AB(KD-L, J1+L), INCA, AB(KD-L+1, J1+L), INCA, D(J1), WORK(J1), KD1 )
									zlartv( nrt, AB, inca, offsetAB + ( kd - l - 1 ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( kd - l ) * strideAB1 + ( j1 + l - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
								}
							}
						} else {
							j1end = j1 + ( kd1 * ( nr - 2 ) );
							if ( j1end >= j1 ) {
								for ( jinc = j1; jinc <= j1end; jinc += kd1 ) {
									// Fortran: ZROT( KD-1, AB(KD-1, JIN+1), INCX, AB(KD, JIN+1), INCX, D(JIN), WORK(JIN) )
									p = ( offsetWork + ( jinc - 1 ) * strideWork ) * 2;
									sn[ 0 ] = WORKv[ p ];
									sn[ 1 ] = WORKv[ p + 1 ];
									zrot( kd - 1, AB, incx, offsetAB + ( kd - 2 ) * strideAB1 + jinc * strideAB2, AB, incx, offsetAB + ( kd - 1 ) * strideAB1 + jinc * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], sn );
								}
							}
							lend = Math.min( kdm1, N - j2 );
							last = j1end + kd1;
							if ( lend > 0 ) {
								// Fortran: ZROT( LEND, AB(KD-1, LAST+1), INCX, AB(KD, LAST+1), INCX, D(LAST), WORK(LAST) )
								p = ( offsetWork + ( last - 1 ) * strideWork ) * 2;
								sn[ 0 ] = WORKv[ p ];
								sn[ 1 ] = WORKv[ p + 1 ];
								zrot( lend, AB, incx, offsetAB + ( kd - 2 ) * strideAB1 + last * strideAB2, AB, incx, offsetAB + ( kd - 1 ) * strideAB1 + last * strideAB2, d[ offsetD + ( last - 1 ) * strideD ], sn );
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

								// Fortran: ZROT( NQ, Q(IQB, J-1), 1, Q(IQB, J), 1, D(J), DCONJG(WORK(J)) )
								p = ( offsetWork + ( j - 1 ) * strideWork ) * 2;
								conjSn[ 0 ] = WORKv[ p ];
								conjSn[ 1 ] = -WORKv[ p + 1 ];
								zrot( nq, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], conjSn );
							}
						} else {
							for ( j = j1; j <= j2; j += kd1 ) {
								// Fortran: ZROT( N, Q(1, J-1), 1, Q(1, J), 1, D(J), DCONJG(WORK(J)) )
								p = ( offsetWork + ( j - 1 ) * strideWork ) * 2;
								conjSn[ 0 ] = WORKv[ p ];
								conjSn[ 1 ] = -WORKv[ p + 1 ];
								zrot( N, Q, strideQ1, offsetQ + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], conjSn );
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
						// Complex multiply: WORK[j+kd-1] = WORK[j-1] * AB(1, j+kd)
						p = ( offsetWork + ( j - 1 ) * strideWork ) * 2;
						wr = WORKv[ p ];
						wi = WORKv[ p + 1 ];
						p = ( offsetAB + ( j + kd - 1 ) * strideAB2 ) * 2;
						tr = ABv[ p ];
						ti = ABv[ p + 1 ];
						p = ( offsetWork + ( j + kd - 1 ) * strideWork ) * 2;
						WORKv[ p ] = wr * tr - wi * ti;
						WORKv[ p + 1 ] = wr * ti + wi * tr;

						// Fortran: AB(1, J+KD) = D(J) * AB(1, J+KD)
						p = ( offsetAB + ( j + kd - 1 ) * strideAB2 ) * 2;
						tr = ABv[ p ];
						ti = ABv[ p + 1 ];
						ABv[ p ] = d[ offsetD + ( j - 1 ) * strideD ] * tr;
						ABv[ p + 1 ] = d[ offsetD + ( j - 1 ) * strideD ] * ti;
					}
				}
			}
		}

		if ( kd > 0 ) {
			// Make off-diagonal elements real and copy them to E.
			for ( i = 1; i <= N - 1; i++ ) {
				// Fortran: T = AB(KD, I+1)
				p = ( offsetAB + ( kd - 1 ) * strideAB1 + i * strideAB2 ) * 2;
				tr = ABv[ p ];
				ti = ABv[ p + 1 ];
				abst = Math.sqrt( tr * tr + ti * ti );
				ABv[ p ] = abst;
				ABv[ p + 1 ] = 0.0;
				e[ offsetE + ( i - 1 ) * strideE ] = abst;
				if ( abst === 0.0 ) {
					tr = 1.0;
					ti = 0.0;
				} else {
					// T = T / ABST (normalize)
					tr /= abst;
					ti /= abst;
				}
				if ( i < N - 1 ) {
					// AB(KD, I+2) = AB(KD, I+2) * T
					p = ( offsetAB + ( kd - 1 ) * strideAB1 + ( i + 1 ) * strideAB2 ) * 2;
					wr = ABv[ p ];
					wi = ABv[ p + 1 ];
					ABv[ p ] = wr * tr - wi * ti;
					ABv[ p + 1 ] = wr * ti + wi * tr;
				}
				if ( wantq ) {
					// Fortran: ZSCAL( N, DCONJG(T), Q(1, I+1), 1 )
					zscal( N, new Complex128( tr, -ti ), Q, strideQ1, offsetQ + i * strideQ2 );
				}
			}
		} else {
			// Set E to zero if original matrix was diagonal.
			for ( i = 1; i <= N - 1; i++ ) {
				e[ offsetE + ( i - 1 ) * strideE ] = 0.0;
			}
		}

		// Copy diagonal elements to D.
		// Fortran: D(I) = DBLE(AB(KD1, I))
		for ( i = 1; i <= N; i++ ) {
			p = ( offsetAB + kd * strideAB1 + ( i - 1 ) * strideAB2 ) * 2;
			d[ offsetD + ( i - 1 ) * strideD ] = ABv[ p ];
		}
	} else {
		// Lower triangle case.
		if ( kd > 1 ) {
			// Reduce to complex Hermitian tridiagonal form, working with lower triangle.
			nr = 0;
			j1 = kdn + 2; // 1-based
			j2 = 1;

			// Force diagonal real: AB(1, 1) = DBLE(AB(1, 1))
			p = offsetAB * 2;
			ABv[ p + 1 ] = 0.0;

			for ( i = 1; i <= N - 2; i++ ) {
				// Reduce i-th column of matrix to tridiagonal form.
				for ( k = kdn + 1; k >= 2; k-- ) {
					j1 += kdn;
					j2 += kdn;

					if ( nr > 0 ) {
						// Generate plane rotations to annihilate nonzero elements
						// Which have been created outside the band.

						// Fortran: ZLARGV( NR, AB(KD1, J1-KD1), INCA, WORK(J1), KD1, D(J1), KD1 )
						zlargv( nr, AB, inca, offsetAB + kd * strideAB1 + ( j1 - kd1 - 1 ) * strideAB2, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD );

						// Apply plane rotations from one side.
						if ( nr > ( 2 * kd ) - 1 ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								// Fortran: ZLARTV( NR, AB(KD1-L, J1-KD1+L), INCA, AB(KD1-L+1, J1-KD1+L), INCA, D(J1), WORK(J1), KD1 )
								zlartv( nr, AB, inca, offsetAB + ( kd - l ) * strideAB1 + ( j1 - kd1 + l - 1 ) * strideAB2, AB, inca, offsetAB + ( kd - l + 1 ) * strideAB1 + ( j1 - kd1 + l - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
							}
						} else {
							jend = j1 + ( kd1 * ( nr - 1 ) );
							for ( jinc = j1; jinc <= jend; jinc += kd1 ) {
								// Fortran: ZROT( KDM1, AB(KD, JINC-KD), INCX, AB(KD1, JINC-KD), INCX, D(JINC), WORK(JINC) )
								p = ( offsetWork + ( jinc - 1 ) * strideWork ) * 2;
								sn[ 0 ] = WORKv[ p ];
								sn[ 1 ] = WORKv[ p + 1 ];
								zrot( kdm1, AB, incx, offsetAB + ( kd - 1 ) * strideAB1 + ( jinc - kd - 1 ) * strideAB2, AB, incx, offsetAB + kd * strideAB1 + ( jinc - kd - 1 ) * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], sn );
							}
						}
					}

					if ( k > 2 ) {
						if ( k <= N - i + 1 ) {
							// Generate plane rotation to annihilate a(i+k-1,i) within the band.
							// Fortran: ZLARTG( AB(K-1, I), AB(K, I), D(I+K-1), WORK(I+K-1), TEMP )
							zlartg( AB, offsetAB + ( k - 2 ) * strideAB1 + ( i - 1 ) * strideAB2, AB, offsetAB + ( k - 1 ) * strideAB1 + ( i - 1 ) * strideAB2, d, offsetD + ( i + k - 2 ) * strideD, WORK, offsetWork + ( i + k - 2 ) * strideWork, tempArr, 0 );

							// AB(K-1, I) = TEMP
							p = ( offsetAB + ( k - 2 ) * strideAB1 + ( i - 1 ) * strideAB2 ) * 2;
							ABv[ p ] = tempv[ 0 ];
							ABv[ p + 1 ] = tempv[ 1 ];

							// Apply rotation from the left.

							// Fortran: ZROT( K-3, AB(K-2, I+1), LDAB-1, AB(K-1, I+1), LDAB-1, D(I+K-1), WORK(I+K-1) )
							p = ( offsetWork + ( i + k - 2 ) * strideWork ) * 2;
							sn[ 0 ] = WORKv[ p ];
							sn[ 1 ] = WORKv[ p + 1 ];
							zrot( k - 3, AB, incx, offsetAB + ( k - 3 ) * strideAB1 + i * strideAB2, AB, incx, offsetAB + ( k - 2 ) * strideAB1 + i * strideAB2, d[ offsetD + ( i + k - 2 ) * strideD ], sn );
						}
						nr += 1;
						j1 -= kdn + 1;
					}

					// Apply plane rotations from both sides to diagonal blocks.
					if ( nr > 0 ) {
						// Fortran: ZLAR2V( NR, AB(1, J1-1), AB(1, J1), AB(2, J1-1), INCA, D(J1), WORK(J1), KD1 )
						zlar2v( nr, AB, inca, offsetAB + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + ( j1 - 1 ) * strideAB2, AB, inca, offsetAB + strideAB1 + ( j1 - 2 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
					}

					// Apply plane rotations from the right.
					if ( nr > 0 ) {
						zlacgv( nr, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
						if ( nr > ( 2 * kd ) - 1 ) {
							for ( l = 1; l <= kd - 1; l++ ) {
								if ( j2 + l > N ) {
									nrt = nr - 1;
								} else {
									nrt = nr;
								}
								if ( nrt > 0 ) {
									// Fortran: ZLARTV( NRT, AB(L+2, J1-1), INCA, AB(L+1, J1), INCA, D(J1), WORK(J1), KD1 )
									zlartv( nrt, AB, inca, offsetAB + ( l + 1 ) * strideAB1 + ( j1 - 2 ) * strideAB2, AB, inca, offsetAB + l * strideAB1 + ( j1 - 1 ) * strideAB2, d, kd1 * strideD, offsetD + ( j1 - 1 ) * strideD, WORK, kd1 * strideWork, offsetWork + ( j1 - 1 ) * strideWork );
								}
							}
						} else {
							j1end = j1 + ( kd1 * ( nr - 2 ) );
							if ( j1end >= j1 ) {
								for ( jinc = j1; jinc <= j1end; jinc += kd1 ) {
									// Fortran: ZROT( KDM1, AB(3, J1INC-1), 1, AB(2, J1INC), 1, D(J1INC), WORK(J1INC) )
									p = ( offsetWork + ( jinc - 1 ) * strideWork ) * 2;
									sn[ 0 ] = WORKv[ p ];
									sn[ 1 ] = WORKv[ p + 1 ];
									zrot( kdm1, AB, strideAB1, offsetAB + 2 * strideAB1 + ( jinc - 2 ) * strideAB2, AB, strideAB1, offsetAB + strideAB1 + ( jinc - 1 ) * strideAB2, d[ offsetD + ( jinc - 1 ) * strideD ], sn );
								}
							}
							lend = Math.min( kdm1, N - j2 );
							last = j1end + kd1;
							if ( lend > 0 ) {
								// Fortran: ZROT( LEND, AB(3, LAST-1), 1, AB(2, LAST), 1, D(LAST), WORK(LAST) )
								p = ( offsetWork + ( last - 1 ) * strideWork ) * 2;
								sn[ 0 ] = WORKv[ p ];
								sn[ 1 ] = WORKv[ p + 1 ];
								zrot( lend, AB, strideAB1, offsetAB + 2 * strideAB1 + ( last - 2 ) * strideAB2, AB, strideAB1, offsetAB + strideAB1 + ( last - 1 ) * strideAB2, d[ offsetD + ( last - 1 ) * strideD ], sn );
							}
						}
					}

					if ( wantq ) {
						// Accumulate product of plane rotations in Q.
						// NOTE: lower case uses WORK(J) directly (no conjugate)
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

								// Fortran: ZROT( NQ, Q(IQB, J-1), 1, Q(IQB, J), 1, D(J), WORK(J) )
								p = ( offsetWork + ( j - 1 ) * strideWork ) * 2;
								sn[ 0 ] = WORKv[ p ];
								sn[ 1 ] = WORKv[ p + 1 ];
								zrot( nq, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( iqb - 1 ) * strideQ1 + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], sn );
							}
						} else {
							for ( j = j1; j <= j2; j += kd1 ) {
								// Fortran: ZROT( N, Q(1, J-1), 1, Q(1, J), 1, D(J), WORK(J) )
								p = ( offsetWork + ( j - 1 ) * strideWork ) * 2;
								sn[ 0 ] = WORKv[ p ];
								sn[ 1 ] = WORKv[ p + 1 ];
								zrot( N, Q, strideQ1, offsetQ + ( j - 2 ) * strideQ2, Q, strideQ1, offsetQ + ( j - 1 ) * strideQ2, d[ offsetD + ( j - 1 ) * strideD ], sn );
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
						p = ( offsetWork + ( j - 1 ) * strideWork ) * 2;
						wr = WORKv[ p ];
						wi = WORKv[ p + 1 ];
						p = ( offsetAB + kd * strideAB1 + ( j - 1 ) * strideAB2 ) * 2;
						tr = ABv[ p ];
						ti = ABv[ p + 1 ];
						p = ( offsetWork + ( j + kd - 1 ) * strideWork ) * 2;
						WORKv[ p ] = wr * tr - wi * ti;
						WORKv[ p + 1 ] = wr * ti + wi * tr;

						// Fortran: AB(KD1, J) = D(J) * AB(KD1, J)
						p = ( offsetAB + kd * strideAB1 + ( j - 1 ) * strideAB2 ) * 2;
						tr = ABv[ p ];
						ti = ABv[ p + 1 ];
						ABv[ p ] = d[ offsetD + ( j - 1 ) * strideD ] * tr;
						ABv[ p + 1 ] = d[ offsetD + ( j - 1 ) * strideD ] * ti;
					}
				}
			}
		}

		if ( kd > 0 ) {
			// Make off-diagonal elements real and copy them to E.
			for ( i = 1; i <= N - 1; i++ ) {
				// Fortran: T = AB(2, I)
				p = ( offsetAB + strideAB1 + ( i - 1 ) * strideAB2 ) * 2;
				tr = ABv[ p ];
				ti = ABv[ p + 1 ];
				abst = Math.sqrt( tr * tr + ti * ti );
				ABv[ p ] = abst;
				ABv[ p + 1 ] = 0.0;
				e[ offsetE + ( i - 1 ) * strideE ] = abst;
				if ( abst === 0.0 ) {
					tr = 1.0;
					ti = 0.0;
				} else {
					// T = T / ABST
					tr /= abst;
					ti /= abst;
				}
				if ( i < N - 1 ) {
					// AB(2, I+1) = AB(2, I+1) * T
					p = ( offsetAB + strideAB1 + i * strideAB2 ) * 2;
					wr = ABv[ p ];
					wi = ABv[ p + 1 ];
					ABv[ p ] = wr * tr - wi * ti;
					ABv[ p + 1 ] = wr * ti + wi * tr;
				}
				if ( wantq ) {
					// Fortran: ZSCAL( N, T, Q(1, I+1), 1 )
					// Note: lower case uses T (not DCONJG(T))
					zscal( N, new Complex128( tr, ti ), Q, strideQ1, offsetQ + i * strideQ2 );
				}
			}
		} else {
			// Set E to zero if original matrix was diagonal.
			for ( i = 1; i <= N - 1; i++ ) {
				e[ offsetE + ( i - 1 ) * strideE ] = 0.0;
			}
		}

		// Copy diagonal elements to D.
		// Fortran: D(I) = DBLE(AB(1, I))
		for ( i = 1; i <= N; i++ ) {
			p = ( offsetAB + ( i - 1 ) * strideAB2 ) * 2;
			d[ offsetD + ( i - 1 ) * strideD ] = ABv[ p ];
		}
	}

	return 0;
}


// EXPORTS //

export default zhbtrd;
