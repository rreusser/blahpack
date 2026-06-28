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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zspr from '../../zspr/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;

// Module-level vars for cDiv output
var cdR = 0.0;
var cdI = 0.0;


// FUNCTIONS //

/**
* Returns the 0-based position in packed upper storage for 1-based element (i,j) where i<=j.
*
* Fortran: `AP(i + j*(j-1)/2)`, 1-based
* JS: `i-1 + j*(j-1)/2`, 0-based
*
* @private
* @param {integer} i - 1-based row index
* @param {integer} j - 1-based column index
* @returns {integer} 0-based packed index
*/
function iupp( i, j ) {
	return ( i - 1 ) + ( ( j * ( j - 1 ) / 2 )|0 );
}

/**
* Returns the 0-based position in packed lower storage for 1-based element (i,j) where i>=j.
*
* Fortran: `AP(i + (2*N-j)*(j-1)/2)`, 1-based
* JS: `i-1 + (2*N-j)*(j-1)/2`, 0-based
*
* @private
* @param {integer} i - 1-based row index
* @param {integer} j - 1-based column index
* @param {integer} N - matrix order
* @returns {integer} 0-based packed index
*/
function ilow( i, j, N ) {
	return ( i - 1 ) + ( ( ( (2 * N) - j ) * ( j - 1 ) / 2 )|0 );
}

/**
* Performs complex division, storing result in module-level cdR and cdI.
*
* Uses Smith's method to avoid overflow.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
*/
function cDiv( ar, ai, br, bi ) {
	var r;
	var d;
	if ( Math.abs( bi ) <= Math.abs( br ) ) {
		r = bi / br;
		d = br + ( bi * r );
		cdR = ( ar + ( ai * r ) ) / d;
		cdI = ( ai - ( ar * r ) ) / d;
	} else {
		r = br / bi;
		d = bi + ( br * r );
		cdR = ( ( ar * r ) + ai ) / d;
		cdI = ( ( ai * r ) - ar ) / d;
	}
}

/**
* Returns CABS1 of a complex number given its real and imaginary parts.
*
* CABS1(z) = |Re(z)| + |Im(z)|
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} CABS1 value
*/
function cabs1( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}


// MAIN //

/**
* Computes the Bunch-Kaufman factorization of a complex symmetric matrix.
* stored in packed format:
*
* `A = U * D * U^T` or `A = L * D * L^T`
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is symmetric and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* NOTE: This is for SYMMETRIC (not Hermitian) matrices. The transpose
* is used (not conjugate transpose). The diagonal elements are fully complex.
*
* IPIV stores 0-based pivot indices. If `IPIV[k]` >= 0, then a 1x1 pivot
* was used and rows/columns k and `IPIV[k]` were interchanged.
* If `IPIV[k]` < 0 (for a 2x2 pivot), then `IPIV[k]` = `IPIV[k+/-1]` = ~p
* where p is the 0-based row/column that was interchanged.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero (1-based)
*/
function zsptrf( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var info;
	var imax;
	var jmax;
	var d11R;
	var d11I;
	var d12R;
	var d12I;
	var d21R;
	var d21I;
	var d22R;
	var d22I;
	var wkR;
	var wkI;
	var r1R;
	var r1I;
	var knc;
	var kpc;
	var npp;
	var Av;
	var tR;
	var tI;
	var tr;
	var ti;
	var kk;
	var kp;
	var kc;
	var kx;
	var p1;
	var p2;
	var p3;
	var p4;
	var p5;
	var k;
	var i;
	var j;

	// All internal variables k, imax, kp, kc, kpc, etc. use Fortran 1-based conventions.

	// kc, knc, kpc are 1-based positions in the packed array.

	// AP is accessed via the Float64 reinterpret view Av.

	// For position pos (1-based), the real part is at Av[ (offsetAP + (pos-1)*strideAP)*2 ]

	// And imaginary part at Av[ (offsetAP + (pos-1)*strideAP)*2 + 1 ].

	Av = reinterpret( AP, 0 );
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^T using the upper triangle of A
		// k decreasing from N to 1 (1-based)
		k = N;
		kc = ( ( ( N - 1 ) * N / 2 )|0 ) + 1;

		while ( k >= 1 ) {
			knc = kc;
			kstep = 1;

			// Diagonal element A(k,k): at packed position kc + k - 1 (1-based)
			p1 = ( offsetAP + ( ( kc + k - 2 ) * strideAP ) ) * 2;
			absakk = cabs1( Av[ p1 ], Av[ p1 + 1 ] );

			// Find largest off-diagonal in column k (rows 1..k-1)
			if ( k > 1 ) {
				// Izamax returns 0-based index; Fortran IMAX is 1-based: add 1
				imax = izamax( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) ) + 1;
				p2 = ( offsetAP + ( ( kc + imax - 2 ) * strideAP ) ) * 2;
				colmax = cabs1( Av[ p2 ], Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero or underflow: set INFO and use 1x1 pivot
				if ( info === 0 ) {
					info = k;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					// Find ROWMAX: largest off-diagonal in row IMAX
					rowmax = 0.0;
					jmax = imax;

					// Scan row imax from column imax+1 to k (upper triangle)
					kx = ( ( imax * ( imax + 1 ) / 2 )|0 ) + imax;
					for ( j = imax + 1; j <= k; j++ ) {
						p3 = ( offsetAP + ( ( kx - 1 ) * strideAP ) ) * 2;
						if ( cabs1( Av[ p3 ], Av[ p3 + 1 ] ) > rowmax ) {
							rowmax = cabs1( Av[ p3 ], Av[ p3 + 1 ] );
							jmax = j;
						}
						kx += j;
					}
					// Start of column imax (1-based)
					kpc = ( ( ( imax - 1 ) * imax / 2 )|0 ) + 1;
					if ( imax > 1 ) {
						// Scan column imax from row 1 to imax-1
						jmax = izamax( imax - 1, AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) ) + 1;
						p3 = ( offsetAP + ( ( kpc + jmax - 2 ) * strideAP ) ) * 2;
						rowmax = Math.max( rowmax, cabs1( Av[ p3 ], Av[ p3 + 1 ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						// No interchange, use 1x1 pivot block
						kp = k;
					} else {
						p3 = ( offsetAP + ( ( kpc + imax - 2 ) * strideAP ) ) * 2;
						if ( cabs1( Av[ p3 ], Av[ p3 + 1 ] ) >= ALPHA * rowmax ) {
							// Interchange rows and columns k and imax, use 1x1 pivot
							kp = imax;
						} else {
							// Interchange rows and columns k-1 and imax, use 2x2 pivot
							kp = imax;
							kstep = 2;
						}
					}
				}

				kk = k - kstep + 1;
				if ( kstep === 2 ) {
					knc = knc - k + 1;
				}
				if ( kp !== kk ) {
					// Interchange rows and columns kp and kk
					// Swap kp-1 elements starting at column kk and column kp
					zswap( kp - 1, AP, strideAP, offsetAP + ( ( knc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) );

					// Swap elements in rows kp+1..kk-1 between column kk (rows) and row kp (cols)
					kx = kpc + kp;
					for ( j = kp + 1; j <= kk - 1; j++ ) {
						kx = kx + j - 1;
						p3 = ( offsetAP + ( ( knc + j - 2 ) * strideAP ) ) * 2;
						p4 = ( offsetAP + ( ( kx - 2 ) * strideAP ) ) * 2;
						tR = Av[ p3 ];
						tI = Av[ p3 + 1 ];
						Av[ p3 ] = Av[ p4 ];
						Av[ p3 + 1 ] = Av[ p4 + 1 ];
						Av[ p4 ] = tR;
						Av[ p4 + 1 ] = tI;
					}
					// Swap diagonal elements kk and kp
					p3 = ( offsetAP + ( ( knc + kk - 2 ) * strideAP ) ) * 2;
					p4 = ( offsetAP + ( ( kpc + kp - 2 ) * strideAP ) ) * 2;
					tR = Av[ p3 ];
					tI = Av[ p3 + 1 ];
					Av[ p3 ] = Av[ p4 ];
					Av[ p3 + 1 ] = Av[ p4 + 1 ];
					Av[ p4 ] = tR;
					Av[ p4 + 1 ] = tI;

					if ( kstep === 2 ) {
						// Swap off-diagonal element in 2x2 block
						p3 = ( offsetAP + ( ( kc + k - 3 ) * strideAP ) ) * 2;
						p4 = ( offsetAP + ( ( kc + kp - 2 ) * strideAP ) ) * 2;
						tR = Av[ p3 ];
						tI = Av[ p3 + 1 ];
						Av[ p3 ] = Av[ p4 ];
						Av[ p3 + 1 ] = Av[ p4 + 1 ];
						Av[ p4 ] = tR;
						Av[ p4 + 1 ] = tI;
					}
				}

				// Update the leading submatrix
				if ( kstep === 1 ) {
					// 1x1 pivot block
					// R1 = CONE / AP(KC+K-1)
					p1 = ( offsetAP + ( ( kc + k - 2 ) * strideAP ) ) * 2;
					cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
					r1R = cdR;
					r1I = cdI;

					// zspr(uplo, k-1, -R1, AP(KC), 1, AP)
					zspr( uplo, k - 1, new Complex128( -r1R, -r1I ), AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP );

					// zscal(k-1, R1, AP(KC), 1)
					zscal( k - 1, new Complex128( r1R, r1I ), AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
				} else if ( k > 2 ) {
					// 2x2 pivot block
					// D12 = AP(K-1, K) = AP[ iupp(k-1, k) ]
					p1 = ( offsetAP + ( iupp( k - 1, k ) * strideAP ) ) * 2;
					d12R = Av[ p1 ];
					d12I = Av[ p1 + 1 ];

					// D22 = AP(K-1, K-1) / D12
					p2 = ( offsetAP + ( iupp( k - 1, k - 1 ) * strideAP ) ) * 2;
					cDiv( Av[ p2 ], Av[ p2 + 1 ], d12R, d12I );
					d22R = cdR;
					d22I = cdI;

					// D11 = AP(K, K) / D12
					p3 = ( offsetAP + ( iupp( k, k ) * strideAP ) ) * 2;
					cDiv( Av[ p3 ], Av[ p3 + 1 ], d12R, d12I );
					d11R = cdR;
					d11I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = ( d11R * d22R ) - ( d11I * d22I ) - 1.0;
					ti = ( d11R * d22I ) + ( d11I * d22R );
					cDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					// D12 = T / D12
					cDiv( r1R, r1I, d12R, d12I );
					d12R = cdR;
					d12I = cdI;

					for ( j = k - 2; j >= 1; j-- ) {
						// WKM1 = D12 * (D11*AP(J,K-1) - AP(J,K))
						p1 = ( offsetAP + ( iupp( j, k - 1 ) * strideAP ) ) * 2;
						p2 = ( offsetAP + ( iupp( j, k ) * strideAP ) ) * 2;

						// D11*AP(J,K-1)
						tr = ( d11R * Av[ p1 ] ) - ( d11I * Av[ p1 + 1 ] );
						ti = ( d11R * Av[ p1 + 1 ] ) + ( d11I * Av[ p1 ] );

						// D11*AP(J,K-1) - AP(J,K)
						tr -= Av[ p2 ];
						ti -= Av[ p2 + 1 ];

						// WKM1 = D12 * result
						wkm1R = ( d12R * tr ) - ( d12I * ti );
						wkm1I = ( d12R * ti ) + ( d12I * tr );

						// WK = D12 * (D22*AP(J,K) - AP(J,K-1))
						tr = ( d22R * Av[ p2 ] ) - ( d22I * Av[ p2 + 1 ] );
						ti = ( d22R * Av[ p2 + 1 ] ) + ( d22I * Av[ p2 ] );
						tr -= Av[ p1 ];
						ti -= Av[ p1 + 1 ];

						wkR = ( d12R * tr ) - ( d12I * ti );
						wkI = ( d12R * ti ) + ( d12I * tr );

						for ( i = j; i >= 1; i-- ) {
							// AP(I,J) -= AP(I,K)*WK + AP(I,K-1)*WKM1
							p3 = ( offsetAP + ( iupp( i, j ) * strideAP ) ) * 2;
							p4 = ( offsetAP + ( iupp( i, k ) * strideAP ) ) * 2;
							p5 = ( offsetAP + ( iupp( i, k - 1 ) * strideAP ) ) * 2;

							tr = ( Av[ p4 ] * wkR ) - ( Av[ p4 + 1 ] * wkI );
							ti = ( Av[ p4 ] * wkI ) + ( Av[ p4 + 1 ] * wkR );
							tr += ( Av[ p5 ] * wkm1R ) - ( Av[ p5 + 1 ] * wkm1I );
							ti += ( Av[ p5 ] * wkm1I ) + ( Av[ p5 + 1 ] * wkm1R );
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}
						Av[ p2 ] = wkR;
						Av[ p2 + 1 ] = wkI;
						Av[ p1 ] = wkm1R;
						Av[ p1 + 1 ] = wkm1I;
					}
				}
			}

			// Store IPIV (convert 1-based kp to 0-based)
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = kp - 1;
			} else {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = ~( kp - 1 );
				IPIV[ offsetIPIV + ( ( k - 2 ) * strideIPIV ) ] = ~( kp - 1 );
			}

			k -= kstep;
			kc = knc - k;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle of A
		// k increasing from 1 to N (1-based)
		k = 1;
		kc = 1;
		npp = ( ( N * ( N + 1 ) / 2 )|0 );

		while ( k <= N ) {
			knc = kc;
			kstep = 1;

			// Diagonal element A(k,k): at packed position kc (1-based)
			p1 = ( offsetAP + ( ( kc - 1 ) * strideAP ) ) * 2;
			absakk = cabs1( Av[ p1 ], Av[ p1 + 1 ] );

			// Find largest off-diagonal in column k (rows k+1..N)
			if ( k < N ) {
				imax = k + izamax( N - k, AP, strideAP, offsetAP + ( kc * strideAP ) ) + 1;
				p2 = ( offsetAP + ( ( kc + imax - k - 1 ) * strideAP ) ) * 2;
				colmax = cabs1( Av[ p2 ], Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Find ROWMAX in row IMAX
					rowmax = 0.0;
					kx = kc + imax - k;
					for ( j = k; j <= imax - 1; j++ ) {
						p3 = ( offsetAP + ( ( kx - 1 ) * strideAP ) ) * 2;
						if ( cabs1( Av[ p3 ], Av[ p3 + 1 ] ) > rowmax ) {
							rowmax = cabs1( Av[ p3 ], Av[ p3 + 1 ] );
							jmax = j;
						}
						kx = kx + N - j;
					}
					// Start of column imax in lower packed (1-based)
					kpc = npp - ( ( ( N - imax + 1 ) * ( N - imax + 2 ) / 2 )|0 ) + 1;
					if ( imax < N ) {
						jmax = imax + izamax( N - imax, AP, strideAP, offsetAP + ( kpc * strideAP ) ) + 1;
						p3 = ( offsetAP + ( ( kpc + jmax - imax - 1 ) * strideAP ) ) * 2;
						rowmax = Math.max( rowmax, cabs1( Av[ p3 ], Av[ p3 + 1 ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else {
						p3 = ( offsetAP + ( ( kpc - 1 ) * strideAP ) ) * 2;
						if ( cabs1( Av[ p3 ], Av[ p3 + 1 ] ) >= ALPHA * rowmax ) {
							kp = imax;
						} else {
							kp = imax;
							kstep = 2;
						}
					}
				}

				kk = k + kstep - 1;
				if ( kstep === 2 ) {
					knc = knc + N - k + 1;
				}
				if ( kp !== kk ) {
					// Swap trailing elements after row kp
					if ( kp < N ) {
						zswap( N - kp, AP, strideAP, offsetAP + ( ( knc + kp - kk ) * strideAP ), AP, strideAP, offsetAP + ( kpc * strideAP ) );
					}
					// Swap elements between rows kk+1..kp-1
					kx = knc + kp - kk;
					for ( j = kk + 1; j <= kp - 1; j++ ) {
						kx = kx + N - j + 1;
						p3 = ( offsetAP + ( ( knc + j - kk - 1 ) * strideAP ) ) * 2;
						p4 = ( offsetAP + ( ( kx - 1 ) * strideAP ) ) * 2;
						tR = Av[ p3 ];
						tI = Av[ p3 + 1 ];
						Av[ p3 ] = Av[ p4 ];
						Av[ p3 + 1 ] = Av[ p4 + 1 ];
						Av[ p4 ] = tR;
						Av[ p4 + 1 ] = tI;
					}
					// Swap diagonals
					p3 = ( offsetAP + ( ( knc - 1 ) * strideAP ) ) * 2;
					p4 = ( offsetAP + ( ( kpc - 1 ) * strideAP ) ) * 2;
					tR = Av[ p3 ];
					tI = Av[ p3 + 1 ];
					Av[ p3 ] = Av[ p4 ];
					Av[ p3 + 1 ] = Av[ p4 + 1 ];
					Av[ p4 ] = tR;
					Av[ p4 + 1 ] = tI;
					if ( kstep === 2 ) {
						p3 = ( offsetAP + ( kc * strideAP ) ) * 2;
						p4 = ( offsetAP + ( ( kc + kp - k - 1 ) * strideAP ) ) * 2;
						tR = Av[ p3 ];
						tI = Av[ p3 + 1 ];
						Av[ p3 ] = Av[ p4 ];
						Av[ p3 + 1 ] = Av[ p4 + 1 ];
						Av[ p4 ] = tR;
						Av[ p4 + 1 ] = tI;
					}
				}

				// Update the trailing submatrix
				if ( kstep === 1 ) {
					if ( k < N ) {
						// R1 = 1 / AP(KC)
						p1 = ( offsetAP + ( ( kc - 1 ) * strideAP ) ) * 2;
						cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
						r1R = cdR;
						r1I = cdI;

						zspr( uplo, N - k, new Complex128( -r1R, -r1I ), AP, strideAP, offsetAP + ( kc * strideAP ), AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ) );

						// Store L(k) in column k
						zscal( N - k, new Complex128( r1R, r1I ), AP, strideAP, offsetAP + ( kc * strideAP ) );
					}
				} else if ( k < N - 1 ) {
					// 2x2 pivot block
					// D21 = AP(K+1, K) = AP[ ilow(k+1, k, N) ]
					p1 = ( offsetAP + ( ilow( k + 1, k, N ) * strideAP ) ) * 2;
					d21R = Av[ p1 ];
					d21I = Av[ p1 + 1 ];

					// D11 = AP(K+1, K+1) / D21
					p2 = ( offsetAP + ( ilow( k + 1, k + 1, N ) * strideAP ) ) * 2;
					cDiv( Av[ p2 ], Av[ p2 + 1 ], d21R, d21I );
					d11R = cdR;
					d11I = cdI;

					// D22 = AP(K, K) / D21
					p3 = ( offsetAP + ( ilow( k, k, N ) * strideAP ) ) * 2;
					cDiv( Av[ p3 ], Av[ p3 + 1 ], d21R, d21I );
					d22R = cdR;
					d22I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = ( d11R * d22R ) - ( d11I * d22I ) - 1.0;
					ti = ( d11R * d22I ) + ( d11I * d22R );
					cDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					// D21 = T / D21
					cDiv( r1R, r1I, d21R, d21I );
					d21R = cdR;
					d21I = cdI;

					for ( j = k + 2; j <= N; j++ ) {
						p1 = ( offsetAP + ( ilow( j, k, N ) * strideAP ) ) * 2;
						p2 = ( offsetAP + ( ilow( j, k + 1, N ) * strideAP ) ) * 2;

						// WK = D21 * (D11*AP(J,K) - AP(J,K+1))
						tr = ( d11R * Av[ p1 ] ) - ( d11I * Av[ p1 + 1 ] );
						ti = ( d11R * Av[ p1 + 1 ] ) + ( d11I * Av[ p1 ] );
						tr -= Av[ p2 ];
						ti -= Av[ p2 + 1 ];
						wkR = ( d21R * tr ) - ( d21I * ti );
						wkI = ( d21R * ti ) + ( d21I * tr );

						// WKP1 = D21 * (D22*AP(J,K+1) - AP(J,K))
						tr = ( d22R * Av[ p2 ] ) - ( d22I * Av[ p2 + 1 ] );
						ti = ( d22R * Av[ p2 + 1 ] ) + ( d22I * Av[ p2 ] );
						tr -= Av[ p1 ];
						ti -= Av[ p1 + 1 ];
						wkp1R = ( d21R * tr ) - ( d21I * ti );
						wkp1I = ( d21R * ti ) + ( d21I * tr );

						for ( i = j; i <= N; i++ ) {
							// AP(I,J) -= AP(I,K)*WK + AP(I,K+1)*WKP1
							p3 = ( offsetAP + ( ilow( i, j, N ) * strideAP ) ) * 2;
							p4 = ( offsetAP + ( ilow( i, k, N ) * strideAP ) ) * 2;
							p5 = ( offsetAP + ( ilow( i, k + 1, N ) * strideAP ) ) * 2;

							tr = ( Av[ p4 ] * wkR ) - ( Av[ p4 + 1 ] * wkI );
							ti = ( Av[ p4 ] * wkI ) + ( Av[ p4 + 1 ] * wkR );
							tr += ( Av[ p5 ] * wkp1R ) - ( Av[ p5 + 1 ] * wkp1I );
							ti += ( Av[ p5 ] * wkp1I ) + ( Av[ p5 + 1 ] * wkp1R );
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}
						Av[ p1 ] = wkR;
						Av[ p1 + 1 ] = wkI;
						Av[ p2 ] = wkp1R;
						Av[ p2 + 1 ] = wkp1I;
					}
				}
			}

			// Store IPIV (convert 1-based kp to 0-based)
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = kp - 1;
			} else {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = ~( kp - 1 );
				IPIV[ offsetIPIV + ( k * strideIPIV ) ] = ~( kp - 1 );
			}

			k += kstep;
			kc = knc + N - k + 2;
		}
	}

	return info;
}


// EXPORTS //

export default zsptrf;
