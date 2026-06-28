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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MODULES //

import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import zsyr from './../../zsyr/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;

// Module-level vars for cDiv output.
var cdR = 0.0;
var cdI = 0.0;


// FUNCTIONS //

/**
* Perform complex division via Smith's method, storing result in module-level `cdR`/`cdI`.
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
		d = br + (bi * r);
		cdR = ( ar + (ai * r) ) / d;
		cdI = ( ai - (ar * r) ) / d;
	} else {
		r = br / bi;
		d = bi + (br * r);
		cdR = ( (ar * r) + ai ) / d;
		cdI = ( (ai * r) - ar ) / d;
	}
}


// MAIN //

/**
* Factorizes a complex symmetric indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* ## Notes
*
* -   Computes `A = U*D*U^T` or `A = L*D*L^T` (transpose, NOT conjugate transpose), where `D` is complex symmetric and block-diagonal with 1-by-1 and 2-by-2 blocks.
* -   IPIV stores 0-based pivot indices. If `IPIV[k]` is non-negative, a 1x1 pivot was used; if negative, BOTH entries of the 2x2 pivot block are negative and each encodes its own swap target via bitwise NOT.
*
* @private
* @param {string} uplo - specifies whether to reference the upper or lower triangular part of `A`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - output pivot index array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} `info` - 0 if successful, k (1-based) if `D(k,k)` is exactly zero.
*/
function zsytf2Rook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var dtemp;
	var itemp;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var info;
	var done;
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
	var r1R;
	var r1I;
	var sa1;
	var sa2;
	var wkR;
	var wkI;
	var oA;
	var Av;
	var tR;
	var tI;
	var tr;
	var ti;
	var kk;
	var kp;
	var p1;
	var p2;
	var p3;
	var p4;
	var pk;
	var p;
	var k;
	var i;
	var j;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	Av = reinterpret( A, 0 );
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^T using the upper triangle; k decreases from N-1 to 0.
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;
			p = k;

			pk = oA + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ pk ] ) + Math.abs( Av[ pk + 1 ] );

			if ( k > 0 ) {
				imax = izamax( k, A, strideA1, offsetA + (k * strideA2) );
				p2 = oA + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
							jmax = imax + 1 + izamax( k - imax, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2) );
							p3 = oA + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}
						if ( imax > 0 ) {
							itemp = izamax( imax, A, strideA1, offsetA + (imax * strideA2) );
							p4 = oA + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						p4 = oA + (imax * sa1) + (imax * sa2);
						if ( ( Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) ) >= ALPHA * rowmax ) {
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				// First swap: interchange rows and columns K and P if kstep=2 and P != K.
				if ( kstep === 2 && p !== k ) {
					if ( p > 0 ) {
						zswap( p, A, strideA1, offsetA + (k * strideA2), A, strideA1, offsetA + (p * strideA2) );
					}
					if ( p < k - 1 ) {
						zswap( k - p - 1, A, strideA1, offsetA + (( p + 1 ) * strideA1) + (k * strideA2), A, strideA2, offsetA + (p * strideA1) + (( p + 1 ) * strideA2) );
					}
					// Swap A(k,k) and A(p,p).
					p1 = oA + (k * sa1) + (k * sa2);
					p2 = oA + (p * sa1) + (p * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
				}

				// Second swap: interchange rows and columns KK and KP.
				kk = k - kstep + 1;
				if ( kp !== kk ) {
					if ( kp > 0 ) {
						zswap( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}
					if ( kk > 0 && kp < kk - 1 ) {
						zswap( kk - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kp + 1 ) * strideA2) );
					}
					p1 = oA + (kk * sa1) + (kk * sa2);
					p2 = oA + (kp * sa1) + (kp * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( kstep === 2 ) {
						p1 = oA + (( k - 1 ) * sa1) + (k * sa2);
						p2 = oA + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				}

				// Update the leading submatrix.
				if ( kstep === 1 ) {
					if ( k > 0 ) {
						p1 = oA + (k * sa1) + (k * sa2);
						if ( ( Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] ) ) >= SFMIN ) {
							// D11 = 1 / A(k,k)
							cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
							r1R = cdR;
							r1I = cdI;
							zsyr( uplo, k, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
							zscal( k, new Complex128( r1R, r1I ), A, strideA1, offsetA + (k * strideA2) );
						} else {
							// D11 = A(k,k); divide column by D11; then rank-1 update with -D11.
							r1R = Av[ p1 ];
							r1I = Av[ p1 + 1 ];
							for ( i = 0; i < k; i++ ) {
								p2 = oA + (i * sa1) + (k * sa2);
								cDiv( Av[ p2 ], Av[ p2 + 1 ], r1R, r1I );
								Av[ p2 ] = cdR;
								Av[ p2 + 1 ] = cdI;
							}
							zsyr( uplo, k, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
						}
					}
				} else if ( k > 1 ) {
					// 2x2 pivot block.
					p1 = oA + (( k - 1 ) * sa1) + (k * sa2);
					d12R = Av[ p1 ];
					d12I = Av[ p1 + 1 ];

					// D22 = A(k-1,k-1) / D12
					p2 = oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
					cDiv( Av[ p2 ], Av[ p2 + 1 ], d12R, d12I );
					d22R = cdR;
					d22I = cdI;

					// D11 = A(k,k) / D12
					p3 = oA + (k * sa1) + (k * sa2);
					cDiv( Av[ p3 ], Av[ p3 + 1 ], d12R, d12I );
					d11R = cdR;
					d11I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = (d11R * d22R) - (d11I * d22I) - 1.0;
					ti = (d11R * d22I) + (d11I * d22R);
					cDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					for ( j = k - 2; j >= 0; j-- ) {
						p1 = oA + (j * sa1) + (( k - 1 ) * sa2);
						p2 = oA + (j * sa1) + (k * sa2);

						// WKM1 = T * (D11*A(j,k-1) - A(j,k))
						tr = (d11R * Av[ p1 ]) - (d11I * Av[ p1 + 1 ]) - Av[ p2 ];
						ti = (d11R * Av[ p1 + 1 ]) + (d11I * Av[ p1 ]) - Av[ p2 + 1 ];
						wkm1R = (r1R * tr) - (r1I * ti);
						wkm1I = (r1R * ti) + (r1I * tr);

						// WK = T * (D22*A(j,k) - A(j,k-1))
						tr = (d22R * Av[ p2 ]) - (d22I * Av[ p2 + 1 ]) - Av[ p1 ];
						ti = (d22R * Av[ p2 + 1 ]) + (d22I * Av[ p2 ]) - Av[ p1 + 1 ];
						wkR = (r1R * tr) - (r1I * ti);
						wkI = (r1R * ti) + (r1I * tr);

						for ( i = j; i >= 0; i-- ) {
							// A(i,j) -= (A(i,k)/D12)*WK + (A(i,k-1)/D12)*WKM1
							p3 = oA + (i * sa1) + (j * sa2);
							p4 = oA + (i * sa1) + (k * sa2);
							pk = oA + (i * sa1) + (( k - 1 ) * sa2);

							// (A(i,k)/D12) * WK:
							cDiv( Av[ p4 ], Av[ p4 + 1 ], d12R, d12I );
							tr = (cdR * wkR) - (cdI * wkI);
							ti = (cdR * wkI) + (cdI * wkR);
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;

							// (A(i,k-1)/D12) * WKM1:
							cDiv( Av[ pk ], Av[ pk + 1 ], d12R, d12I );
							tr = (cdR * wkm1R) - (cdI * wkm1I);
							ti = (cdR * wkm1I) + (cdI * wkm1R);
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}

						// A(j,k) = WK / D12
						cDiv( wkR, wkI, d12R, d12I );
						p2 = oA + (j * sa1) + (k * sa2);
						Av[ p2 ] = cdR;
						Av[ p2 + 1 ] = cdI;

						// A(j,k-1) = WKM1 / D12
						cDiv( wkm1R, wkm1I, d12R, d12I );
						p1 = oA + (j * sa1) + (( k - 1 ) * sa2);
						Av[ p1 ] = cdR;
						Av[ p1 + 1 ] = cdI;
					}
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle; k increases from 0 to N-1.
		k = 0;
		while ( k < N ) {
			kstep = 1;
			p = k;

			pk = oA + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ pk ] ) + Math.abs( Av[ pk + 1 ] );

			if ( k < N - 1 ) {
				imax = k + 1 + izamax( N - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
				p2 = oA + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
							jmax = k + izamax( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2) );
							p3 = oA + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}
						if ( imax < N - 1 ) {
							itemp = imax + 1 + izamax( N - imax - 1, A, strideA1, offsetA + (( imax + 1 ) * strideA1) + (imax * strideA2) );
							p4 = oA + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						p4 = oA + (imax * sa1) + (imax * sa2);
						if ( ( Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) ) >= ALPHA * rowmax ) {
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				// First swap.
				if ( kstep === 2 && p !== k ) {
					if ( p < N - 1 ) {
						zswap( N - p - 1, A, strideA1, offsetA + (( p + 1 ) * strideA1) + (k * strideA2), A, strideA1, offsetA + (( p + 1 ) * strideA1) + (p * strideA2) );
					}
					if ( p > k + 1 ) {
						zswap( p - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA2, offsetA + (p * strideA1) + (( k + 1 ) * strideA2) );
					}
					p1 = oA + (k * sa1) + (k * sa2);
					p2 = oA + (p * sa1) + (p * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
				}

				// Second swap.
				kk = k + kstep - 1;
				if ( kp !== kk ) {
					if ( kp < N - 1 ) {
						zswap( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2) );
					}
					if ( kk < N - 1 && kp > kk + 1 ) {
						zswap( kp - kk - 1, A, strideA1, offsetA + (( kk + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kk + 1 ) * strideA2) );
					}
					p1 = oA + (kk * sa1) + (kk * sa2);
					p2 = oA + (kp * sa1) + (kp * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( kstep === 2 ) {
						p1 = oA + (( k + 1 ) * sa1) + (k * sa2);
						p2 = oA + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				}

				// Update the trailing submatrix.
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						p1 = oA + (k * sa1) + (k * sa2);
						if ( ( Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] ) ) >= SFMIN ) {
							cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
							r1R = cdR;
							r1I = cdI;
							zsyr( uplo, N - k - 1, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
							zscal( N - k - 1, new Complex128( r1R, r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
						} else {
							r1R = Av[ p1 ];
							r1I = Av[ p1 + 1 ];
							for ( i = k + 1; i < N; i++ ) {
								p2 = oA + (i * sa1) + (k * sa2);
								cDiv( Av[ p2 ], Av[ p2 + 1 ], r1R, r1I );
								Av[ p2 ] = cdR;
								Av[ p2 + 1 ] = cdI;
							}
							zsyr( uplo, N - k - 1, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
						}
					}
				} else if ( k < N - 2 ) {
					// 2x2 pivot block.
					p1 = oA + (( k + 1 ) * sa1) + (k * sa2);
					d21R = Av[ p1 ];
					d21I = Av[ p1 + 1 ];

					// D11 = A(k+1,k+1) / D21
					p2 = oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
					cDiv( Av[ p2 ], Av[ p2 + 1 ], d21R, d21I );
					d11R = cdR;
					d11I = cdI;

					// D22 = A(k,k) / D21
					p3 = oA + (k * sa1) + (k * sa2);
					cDiv( Av[ p3 ], Av[ p3 + 1 ], d21R, d21I );
					d22R = cdR;
					d22I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = (d11R * d22R) - (d11I * d22I) - 1.0;
					ti = (d11R * d22I) + (d11I * d22R);
					cDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					for ( j = k + 2; j < N; j++ ) {
						p1 = oA + (j * sa1) + (k * sa2);
						p2 = oA + (j * sa1) + (( k + 1 ) * sa2);

						// WK = T * (D11*A(j,k) - A(j,k+1))
						tr = (d11R * Av[ p1 ]) - (d11I * Av[ p1 + 1 ]) - Av[ p2 ];
						ti = (d11R * Av[ p1 + 1 ]) + (d11I * Av[ p1 ]) - Av[ p2 + 1 ];
						wkR = (r1R * tr) - (r1I * ti);
						wkI = (r1R * ti) + (r1I * tr);

						// WKP1 = T * (D22*A(j,k+1) - A(j,k))
						tr = (d22R * Av[ p2 ]) - (d22I * Av[ p2 + 1 ]) - Av[ p1 ];
						ti = (d22R * Av[ p2 + 1 ]) + (d22I * Av[ p2 ]) - Av[ p1 + 1 ];
						wkp1R = (r1R * tr) - (r1I * ti);
						wkp1I = (r1R * ti) + (r1I * tr);

						for ( i = j; i < N; i++ ) {
							p3 = oA + (i * sa1) + (j * sa2);
							p4 = oA + (i * sa1) + (k * sa2);
							pk = oA + (i * sa1) + (( k + 1 ) * sa2);

							cDiv( Av[ p4 ], Av[ p4 + 1 ], d21R, d21I );
							tr = (cdR * wkR) - (cdI * wkI);
							ti = (cdR * wkI) + (cdI * wkR);
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;

							cDiv( Av[ pk ], Av[ pk + 1 ], d21R, d21I );
							tr = (cdR * wkp1R) - (cdI * wkp1I);
							ti = (cdR * wkp1I) + (cdI * wkp1R);
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}

						cDiv( wkR, wkI, d21R, d21I );
						p1 = oA + (j * sa1) + (k * sa2);
						Av[ p1 ] = cdR;
						Av[ p1 + 1 ] = cdI;

						cDiv( wkp1R, wkp1I, d21R, d21I );
						p2 = oA + (j * sa1) + (( k + 1 ) * sa2);
						Av[ p2 ] = cdR;
						Av[ p2 + 1 ] = cdI;
					}
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ] = ~kp;
			}

			k += kstep;
		}
	}

	return info;
}


// EXPORTS //

export default zsytf2Rook;
