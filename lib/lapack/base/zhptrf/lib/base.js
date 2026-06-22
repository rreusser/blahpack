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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zhpr from '../../../../blas/base/zhpr/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;


// FUNCTIONS //

/**
* Returns |Re(z)| + |Im(z)| for a complex number stored as interleaved re/im at a Float64 offset.
*
* @private
* @param {Float64Array} v - interleaved re/im array
* @param {integer} p - offset to the real part
* @returns {number} cabs1 value
*/
function cabs1( v, p ) {
	return Math.abs( v[ p ] ) + Math.abs( v[ p + 1 ] );
}

/**
* Returns the 0-based Float64 position in packed upper storage for 1-based element (i,j) where i<=j.
*
* Fortran: `AP(i + j*(j-1)/2)`, 1-based
* JS: `(i-1 + j*(j-1)/2) * 2`, 0-based Float64 position (re part)
*
* @private
* @param {integer} i - 1-based row index
* @param {integer} j - 1-based column index
* @returns {integer} 0-based Float64 offset for real part
*/
function iupp( i, j ) {
	return ( ( i - 1 ) + ( ( j * ( j - 1 ) / 2 )|0 ) ) * 2;
}

/**
* Returns the 0-based Float64 position in packed lower storage for 1-based element (i,j) where i>=j.
*
* Fortran: `AP(i + (2*N-j)*(j-1)/2)`, 1-based
* JS: `(i-1 + (2*N-j)*(j-1)/2) * 2`, 0-based Float64 position (re part)
*
* @private
* @param {integer} i - 1-based row index
* @param {integer} j - 1-based column index
* @param {integer} N - matrix order
* @returns {integer} 0-based Float64 offset for real part
*/
function ilow( i, j, N ) {
	return ( ( i - 1 ) + ( ( ( (2 * N) - j ) * ( j - 1 ) / 2 )|0 ) ) * 2;
}


// MAIN //

/**
* Computes the Bunch-Kaufman factorization of a complex Hermitian matrix stored.
* in packed format:
*
* `A = U * D * U^H` or `A = L * D * L^H`
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is Hermitian and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* NOTE: This is for HERMITIAN matrices. The conjugate transpose is used.
* Diagonal elements of A are real.
*
* IPIV stores 0-based pivot indices. If `IPIV[k]` >= 0, then a 1x1 pivot
* was used and rows/columns k and `IPIV[k]` were interchanged.
* If `IPIV[k]` < 0 (for a 2x2 pivot), then `IPIV[k]` = `IPIV[k+/-1]` = ~p
* where p is the 0-based row/column that was interchanged.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed Hermitian matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero (1-based)
*/
function zhptrf( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV ) {
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
	var d12R;
	var d12I;
	var d21R;
	var d21I;
	var wkR;
	var wkI;
	var knc;
	var kpc;
	var npp;
	var d11;
	var d22;
	var sap;
	var oAP;
	var APv;
	var tR;
	var tI;
	var tt;
	var r1;
	var kk;
	var kp;
	var kc;
	var kx;
	var p1;
	var p2;
	var p3;
	var p4;
	var d;
	var k;
	var i;
	var j;

	// All internal variables k, imax, kp, kc, kpc, etc. use Fortran 1-based conventions.

	// kc, knc, kpc are 1-based positions in the packed array.

	// APv is accessed using Float64 positions: oAP + (pos-1)*sap where pos is 1-based complex position.

	APv = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oAP = offsetAP * 2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^H using the upper triangle of A
		k = N;
		kc = ( ( ( N - 1 ) * N / 2 )|0 ) + 1;

		while ( k >= 1 ) {
			knc = kc;
			kstep = 1;

			// Diagonal element A(k,k): at packed position kc + k - 1 (1-based)

			// Diagonal is real for Hermitian
			absakk = Math.abs( APv[ oAP + ( ( kc + k - 2 ) * sap ) ] );

			// Find largest off-diagonal in column k (rows 1..k-1)
			if ( k > 1 ) {
				// Izamax returns 0-based index; Fortran IMAX is 1-based: add 1
				imax = izamax( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) ) + 1;
				colmax = cabs1( APv, oAP + ( ( kc + imax - 2 ) * sap ) );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero: set INFO and use 1x1 pivot
				if ( info === 0 ) {
					info = k;
				}
				kp = k;

				// Force diagonal to real (set imaginary to 0)
				APv[ oAP + ( ( kc + k - 2 ) * sap ) + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					// Find ROWMAX: largest off-diagonal in row IMAX
					rowmax = 0.0;
					jmax = imax;

					// Scan row imax from column imax+1 to k (upper triangle: packed positions)
					kx = ( ( imax * ( imax + 1 ) / 2 )|0 ) + imax;
					for ( j = imax + 1; j <= k; j++ ) {
						if ( cabs1( APv, oAP + ( ( kx - 1 ) * sap ) ) > rowmax ) {
							rowmax = cabs1( APv, oAP + ( ( kx - 1 ) * sap ) );
							jmax = j;
						}
						kx += j;
					}
					// Start of column imax (1-based)
					kpc = ( ( ( imax - 1 ) * imax / 2 )|0 ) + 1;
					if ( imax > 1 ) {
						// Scan column imax from row 1 to imax-1
						jmax = izamax( imax - 1, AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) ) + 1;
						rowmax = Math.max( rowmax, cabs1( APv, oAP + ( ( kpc + jmax - 2 ) * sap ) ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						// No interchange, use 1x1 pivot block
						kp = k;
					} else if ( Math.abs( APv[ oAP + ( ( kpc + imax - 2 ) * sap ) ] ) >= ALPHA * rowmax ) {
						// Interchange rows and columns k and imax, use 1x1 pivot
						kp = imax;
					} else {
						// Interchange rows and columns k-1 and imax, use 2x2 pivot
						kp = imax;
						kstep = 2;
					}
				}

				kk = k - kstep + 1;
				if ( kstep === 2 ) {
					knc = knc - k + 1;
				}
				if ( kp === kk ) {
					// Force diagonal to real
					p1 = oAP + ( ( kc + k - 2 ) * sap );
					APv[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oAP + ( ( kc - 2 ) * sap );
						APv[ p1 + 1 ] = 0.0;
					}
				} else {
					// Interchange rows and columns kp and kk in the leading submatrix
					// Swap kp-1 elements starting at column kk and column kp
					zswap( kp - 1, AP, strideAP, offsetAP + ( ( knc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) );

					// Swap and conjugate elements between rows kp+1..kk-1
					kx = kpc + kp;
					for ( j = kp + 1; j <= kk - 1; j++ ) {
						kx = kx + j - 1;

						// T = conj(AP(knc+j-1)) - element in column kk at row j
						p1 = oAP + ( ( knc + j - 2 ) * sap );
						p2 = oAP + ( ( kx - 2 ) * sap );
						tR = APv[ p1 ];
						tI = -APv[ p1 + 1 ];
						APv[ p1 ] = APv[ p2 ];
						APv[ p1 + 1 ] = -APv[ p2 + 1 ];
						APv[ p2 ] = tR;
						APv[ p2 + 1 ] = tI;
					}
					// Conjugate AP(kx+kk-1) = element A(kp, kk)
					p1 = oAP + ( ( kx + kk - 2 ) * sap );
					APv[ p1 + 1 ] = -APv[ p1 + 1 ];

					// Swap diagonal: real parts only
					p1 = oAP + ( ( knc + kk - 2 ) * sap );
					p2 = oAP + ( ( kpc + kp - 2 ) * sap );
					r1 = APv[ p1 ];
					APv[ p1 ] = APv[ p2 ];
					APv[ p1 + 1 ] = 0.0;
					APv[ p2 ] = r1;
					APv[ p2 + 1 ] = 0.0;

					if ( kstep === 2 ) {
						// Force A(k,k) real
						p1 = oAP + ( ( kc + k - 2 ) * sap );
						APv[ p1 + 1 ] = 0.0;

						// Swap off-diagonal element in 2x2 block
						p1 = oAP + ( ( kc + k - 3 ) * sap );
						p2 = oAP + ( ( kc + kp - 2 ) * sap );
						tR = APv[ p1 ];
						tI = APv[ p1 + 1 ];
						APv[ p1 ] = APv[ p2 ];
						APv[ p1 + 1 ] = APv[ p2 + 1 ];
						APv[ p2 ] = tR;
						APv[ p2 + 1 ] = tI;
					}
				}

				// Update the leading submatrix
				if ( kstep === 1 ) {
					// 1x1 pivot block: D(k) = real(A(k,k))
					// Perform Hermitian rank-1 update: A := A - (1/D(k))*x*x^H
					r1 = 1.0 / APv[ oAP + ( ( kc + k - 2 ) * sap ) ];
					zhpr( uplo, k - 1, -r1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP );

					// Scale column: multiply by 1/D(k)
					zdscal( k - 1, r1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
				} else if ( k > 2 ) {
					// 2x2 pivot block
					// D = |A(k-1,k)| using dlapy2
					p1 = iupp( k - 1, k );
					d = dlapy2( APv[ oAP + p1 ], APv[ oAP + p1 + 1 ] );

					// D22 = real(A(k-1,k-1)) / D
					p2 = iupp( k - 1, k - 1 );
					d22 = APv[ oAP + p2 ] / d;

					// D11 = real(A(k,k)) / D
					p3 = iupp( k, k );
					d11 = APv[ oAP + p3 ] / d;

					// TT = 1 / (D11*D22 - 1)
					tt = 1.0 / ( d11 * d22 - 1.0 );

					// D12 = A(k-1,k) / D (complex)
					d12R = APv[ oAP + p1 ] / d;
					d12I = APv[ oAP + p1 + 1 ] / d;

					// D = TT / D
					d = tt / d;

					for ( j = k - 2; j >= 1; j-- ) {
						// WKM1 = D * (D11*A(j,k-1) - conj(D12)*A(j,k))
						p1 = oAP + iupp( j, k - 1 );
						p2 = oAP + iupp( j, k );

						// D11*A(j,k-1)
						tR = d11 * APv[ p1 ];
						tI = d11 * APv[ p1 + 1 ];

						// - conj(D12)*A(j,k)

						// conj(D12) = (d12R, -d12I)

						// conj(D12)*A(j,k) = d12R*re - (-d12I)*im + i*(d12R*im + (-d12I)*re)

						//                  = d12R*re + d12I*im + i*(d12R*im - d12I*re)
						tR -= ( d12R * APv[ p2 ] + d12I * APv[ p2 + 1 ] );
						tI -= ( d12R * APv[ p2 + 1 ] - d12I * APv[ p2 ] );

						wkm1R = d * tR;
						wkm1I = d * tI;

						// WK = D * (D22*A(j,k) - D12*A(j,k-1))
						tR = d22 * APv[ p2 ];
						tI = d22 * APv[ p2 + 1 ];

						// D12*A(j,k-1) = d12R*re - d12I*im + i*(d12R*im + d12I*re)
						tR -= ( d12R * APv[ p1 ] - d12I * APv[ p1 + 1 ] );
						tI -= ( d12R * APv[ p1 + 1 ] + d12I * APv[ p1 ] );

						wkR = d * tR;
						wkI = d * tI;

						for ( i = j; i >= 1; i-- ) {
							// A(i,j) -= A(i,k)*conj(WK) + A(i,k-1)*conj(WKM1)
							p3 = oAP + iupp( i, j );
							p4 = oAP + iupp( i, k );
							tR = oAP + iupp( i, k - 1 );

							// A(i,k)*conj(WK) = (re*wkR + im*wkI) + i*(im*wkR - re*wkI)
							APv[ p3 ] -= ( APv[ p4 ] * wkR + APv[ p4 + 1 ] * wkI );
							APv[ p3 + 1 ] -= ( APv[ p4 + 1 ] * wkR - APv[ p4 ] * wkI );

							// + A(i,k-1)*conj(WKM1)
							APv[ p3 ] -= ( APv[ tR ] * wkm1R + APv[ tR + 1 ] * wkm1I );
							APv[ p3 + 1 ] -= ( APv[ tR + 1 ] * wkm1R - APv[ tR ] * wkm1I );
						}

						// A(j,k) = WK
						p2 = oAP + iupp( j, k );
						APv[ p2 ] = wkR;
						APv[ p2 + 1 ] = wkI;

						// A(j,k-1) = WKM1
						p1 = oAP + iupp( j, k - 1 );
						APv[ p1 ] = wkm1R;
						APv[ p1 + 1 ] = wkm1I;

						// Force A(j,j) real
						p3 = oAP + iupp( j, j );
						APv[ p3 + 1 ] = 0.0;
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
		// Factorize A as L * D * L^H using the lower triangle of A
		k = 1;
		kc = 1;
		npp = ( ( N * ( N + 1 ) / 2 )|0 );

		while ( k <= N ) {
			knc = kc;
			kstep = 1;

			// Diagonal element A(k,k): at packed position kc (1-based)

			// Diagonal is real for Hermitian
			absakk = Math.abs( APv[ oAP + ( ( kc - 1 ) * sap ) ] );

			// Find largest off-diagonal in column k (rows k+1..N)
			if ( k < N ) {
				imax = k + izamax( N - k, AP, strideAP, offsetAP + ( kc * strideAP ) ) + 1;
				colmax = cabs1( APv, oAP + ( ( kc + imax - k - 1 ) * sap ) );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k;
				}
				kp = k;

				// Force diagonal to real
				APv[ oAP + ( ( kc - 1 ) * sap ) + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Find ROWMAX in row IMAX
					rowmax = 0.0;
					kx = kc + imax - k;
					for ( j = k; j <= imax - 1; j++ ) {
						if ( cabs1( APv, oAP + ( ( kx - 1 ) * sap ) ) > rowmax ) {
							rowmax = cabs1( APv, oAP + ( ( kx - 1 ) * sap ) );
							jmax = j;
						}
						kx = kx + N - j;
					}
					// Start of column imax in lower packed (1-based)
					kpc = npp - ( ( ( N - imax + 1 ) * ( N - imax + 2 ) / 2 )|0 ) + 1;
					if ( imax < N ) {
						jmax = imax + izamax( N - imax, AP, strideAP, offsetAP + ( kpc * strideAP ) ) + 1;
						rowmax = Math.max( rowmax, cabs1( APv, oAP + ( ( kpc + jmax - imax - 1 ) * sap ) ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else if ( Math.abs( APv[ oAP + ( ( kpc - 1 ) * sap ) ] ) >= ALPHA * rowmax ) {
						kp = imax;
					} else {
						kp = imax;
						kstep = 2;
					}
				}

				kk = k + kstep - 1;
				if ( kstep === 2 ) {
					knc = knc + N - k + 1;
				}
				if ( kp === kk ) {
					// Force diagonal to real
					p1 = oAP + ( ( kc - 1 ) * sap );
					APv[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oAP + ( ( knc - 1 ) * sap );
						APv[ p1 + 1 ] = 0.0;
					}
				} else {
					// Swap trailing elements after row kp
					if ( kp < N ) {
						zswap( N - kp, AP, strideAP, offsetAP + ( ( knc + kp - kk ) * strideAP ), AP, strideAP, offsetAP + ( kpc * strideAP ) );
					}
					// Swap and conjugate elements between rows kk+1..kp-1
					kx = knc + kp - kk;
					for ( j = kk + 1; j <= kp - 1; j++ ) {
						kx = kx + N - j + 1;
						p1 = oAP + ( ( knc + j - kk - 1 ) * sap );
						p2 = oAP + ( ( kx - 1 ) * sap );
						tR = APv[ p1 ];
						tI = -APv[ p1 + 1 ];
						APv[ p1 ] = APv[ p2 ];
						APv[ p1 + 1 ] = -APv[ p2 + 1 ];
						APv[ p2 ] = tR;
						APv[ p2 + 1 ] = tI;
					}
					// Conjugate AP(knc+kp-kk) = element A(kp, kk)
					p1 = oAP + ( ( knc + kp - kk - 1 ) * sap );
					APv[ p1 + 1 ] = -APv[ p1 + 1 ];

					// Swap diagonal: real parts only
					p1 = oAP + ( ( knc - 1 ) * sap );
					p2 = oAP + ( ( kpc - 1 ) * sap );
					r1 = APv[ p1 ];
					APv[ p1 ] = APv[ p2 ];
					APv[ p1 + 1 ] = 0.0;
					APv[ p2 ] = r1;
					APv[ p2 + 1 ] = 0.0;

					if ( kstep === 2 ) {
						// Force A(k,k) real
						p1 = oAP + ( ( kc - 1 ) * sap );
						APv[ p1 + 1 ] = 0.0;

						// Swap off-diagonal element
						p1 = oAP + ( kc * sap );
						p2 = oAP + ( ( kc + kp - k - 1 ) * sap );
						tR = APv[ p1 ];
						tI = APv[ p1 + 1 ];
						APv[ p1 ] = APv[ p2 ];
						APv[ p1 + 1 ] = APv[ p2 + 1 ];
						APv[ p2 ] = tR;
						APv[ p2 + 1 ] = tI;
					}
				}

				// Update the trailing submatrix
				if ( kstep === 1 ) {
					if ( k < N ) {
						// 1x1 pivot: rank-1 Hermitian update
						r1 = 1.0 / APv[ oAP + ( ( kc - 1 ) * sap ) ];
						zhpr( uplo, N - k, -r1, AP, strideAP, offsetAP + ( kc * strideAP ), AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ) );

						// Scale column
						zdscal( N - k, r1, AP, strideAP, offsetAP + ( kc * strideAP ) );
					}
				} else if ( k < N - 1 ) {
					// 2x2 pivot block
					// D = |A(k+1,k)| using dlapy2
					p1 = ilow( k + 1, k, N );
					d = dlapy2( APv[ oAP + p1 ], APv[ oAP + p1 + 1 ] );

					// D11 = real(A(k+1,k+1)) / D
					p2 = ilow( k + 1, k + 1, N );
					d11 = APv[ oAP + p2 ] / d;

					// D22 = real(A(k,k)) / D
					p3 = ilow( k, k, N );
					d22 = APv[ oAP + p3 ] / d;

					// TT = 1 / (D11*D22 - 1)
					tt = 1.0 / ( d11 * d22 - 1.0 );

					// D21 = A(k+1,k) / D (complex)
					d21R = APv[ oAP + p1 ] / d;
					d21I = APv[ oAP + p1 + 1 ] / d;

					// D = TT / D
					d = tt / d;

					for ( j = k + 2; j <= N; j++ ) {
						p1 = oAP + ilow( j, k, N );
						p2 = oAP + ilow( j, k + 1, N );

						// WK = D * (D11*A(j,k) - D21*A(j,k+1))
						tR = d11 * APv[ p1 ];
						tI = d11 * APv[ p1 + 1 ];

						// D21*A(j,k+1) = d21R*re - d21I*im + i*(d21R*im + d21I*re)
						tR -= ( d21R * APv[ p2 ] - d21I * APv[ p2 + 1 ] );
						tI -= ( d21R * APv[ p2 + 1 ] + d21I * APv[ p2 ] );
						wkR = d * tR;
						wkI = d * tI;

						// WKP1 = D * (D22*A(j,k+1) - conj(D21)*A(j,k))
						tR = d22 * APv[ p2 ];
						tI = d22 * APv[ p2 + 1 ];

						// conj(D21)*A(j,k) = (d21R + i*(-d21I)) * (re + i*im)

						//                  = d21R*re + d21I*im + i*(d21R*im - d21I*re)
						tR -= ( d21R * APv[ p1 ] + d21I * APv[ p1 + 1 ] );
						tI -= ( d21R * APv[ p1 + 1 ] - d21I * APv[ p1 ] );
						wkp1R = d * tR;
						wkp1I = d * tI;

						for ( i = j; i <= N; i++ ) {
							// A(i,j) -= A(i,k)*conj(WK) + A(i,k+1)*conj(WKP1)
							p3 = oAP + ilow( i, j, N );
							p4 = oAP + ilow( i, k, N );
							tR = oAP + ilow( i, k + 1, N );

							// A(i,k)*conj(WK)
							APv[ p3 ] -= ( APv[ p4 ] * wkR + APv[ p4 + 1 ] * wkI );
							APv[ p3 + 1 ] -= ( APv[ p4 + 1 ] * wkR - APv[ p4 ] * wkI );

							// + A(i,k+1)*conj(WKP1)
							APv[ p3 ] -= ( APv[ tR ] * wkp1R + APv[ tR + 1 ] * wkp1I );
							APv[ p3 + 1 ] -= ( APv[ tR + 1 ] * wkp1R - APv[ tR ] * wkp1I );
						}

						// A(j,k) = WK
						p1 = oAP + ilow( j, k, N );
						APv[ p1 ] = wkR;
						APv[ p1 + 1 ] = wkI;

						// A(j,k+1) = WKP1
						p2 = oAP + ilow( j, k + 1, N );
						APv[ p2 ] = wkp1R;
						APv[ p2 + 1 ] = wkp1I;

						// Force A(j,j) real
						p3 = oAP + ilow( j, j, N );
						APv[ p3 + 1 ] = 0.0;
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

export default zhptrf;
