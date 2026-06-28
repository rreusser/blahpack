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

/* eslint-disable max-depth, max-statements, max-lines-per-function, max-len, max-lines, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zhemv from '../../../../blas/base/zhemv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var NCONE = new Complex128( -1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex Hermitian matrix using the factorization `A = U*D*U**H` or `A = L*D*L**H` computed by `zhetrf_rook` (rook pivoting).
*
* ## Notes
*
* -   `IPIV` is 0-based. Negative values encode 2x2 pivot blocks via bitwise NOT (`~p`). For rook pivoting, both entries of a 2x2 block are encoded independently.
* -   `A` is a `Complex128Array` representing an N-by-N matrix in 2D storage.
* -   `WORK` is a `Complex128Array` of length `N`.
* -   Returns `info`: 0 = success, k > 0 = `D(k,k)` is zero (1-based).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - Hermitian matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf_rook`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace array of length `N`
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zhetriRook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	var akkp1R;
	var akkp1I;
	var kstep;
	var upper;
	var tempR;
	var tempI;
	var dotc;
	var info;
	var akp1;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var ak;
	var kp;
	var ip;
	var p;
	var q;
	var d;
	var j;
	var k;
	var t;

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	info = 0;
	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)
	if ( upper ) {
		for ( info = N; info >= 1; info -= 1 ) {
			ip = IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ];
			p = oA + ( ( info - 1 ) * sa1 ) + ( ( info - 1 ) * sa2 );
			if ( ip >= 0 && Av[ p ] === 0.0 && Av[ p + 1 ] === 0.0 ) {
				return info;
			}
		}
	} else {
		for ( info = 1; info <= N; info += 1 ) {
			ip = IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ];
			p = oA + ( ( info - 1 ) * sa1 ) + ( ( info - 1 ) * sa2 );
			if ( ip >= 0 && Av[ p ] === 0.0 && Av[ p + 1 ] === 0.0 ) {
				return info;
			}
		}
	}
	info = 0;

	if ( upper ) {
		// Compute inv(A) from the factorization A = U*D*U**H
		k = 1;

		while ( k <= N ) {
			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert diagonal (real)
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p ] = 1.0 / Av[ p ];
				Av[ p + 1 ] = 0.0;

				if ( k > 1 ) {
					zcopy( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					dotc = zdotc( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotc );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block: invert
				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				t = cmplx.absAt( Av, q );

				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				ak = Av[ p ] / t;

				q = oA + ( k * sa1 ) + ( k * sa2 );
				akp1 = Av[ q ] / t;

				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				akkp1R = Av[ q ] / t;
				akkp1I = Av[ q + 1 ] / t;

				d = t * ( ( ak * akp1 ) - 1.0 );

				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p ] = akp1 / d;
				Av[ p + 1 ] = 0.0;

				q = oA + ( k * sa1 ) + ( k * sa2 );
				Av[ q ] = ak / d;
				Av[ q + 1 ] = 0.0;

				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				Av[ q ] = -akkp1R / d;
				Av[ q + 1 ] = -akkp1I / d;

				if ( k > 1 ) {
					// Process column k
					zcopy( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					dotc = zdotc( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotc );

					dotc = zdotc( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA2 ) );
					q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
					Av[ q ] -= real( dotc );
					Av[ q + 1 ] -= imag( dotc );

					// Process column k+1
					zcopy( k - 1, A, strideA1, offsetA + ( k * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA2 ) );

					q = oA + ( k * sa1 ) + ( k * sa2 );
					dotc = zdotc( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA2 ) );
					Av[ q ] -= real( dotc );
				}
				kstep = 2;
			}

			if ( kstep === 1 ) {
				// Interchange rows and columns K and IPIV(K) in the leading submatrix
				kp = ip + 1;
				if ( kp !== k ) {
					if ( kp > 1 ) {
						zswap( kp - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( kp - 1 ) * strideA2 ) );
					}
					for ( j = kp + 1; j <= k - 1; j += 1 ) {
						p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
						q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
						tempR = Av[ p ];
						tempI = -Av[ p + 1 ];
						Av[ p ] = Av[ q ];
						Av[ p + 1 ] = -Av[ q + 1 ];
						Av[ q ] = tempR;
						Av[ q + 1 ] = tempI;
					}

					p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					Av[ p + 1 ] = -Av[ p + 1 ];

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}
			} else {
				// 2x2 pivot: swap K with -IPIV(K), then K+1 with -IPIV(K+1)
				kp = ( ~ip ) + 1;
				if ( kp !== k ) {
					if ( kp > 1 ) {
						zswap( kp - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( kp - 1 ) * strideA2 ) );
					}
					for ( j = kp + 1; j <= k - 1; j += 1 ) {
						p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
						q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
						tempR = Av[ p ];
						tempI = -Av[ p + 1 ];
						Av[ p ] = Av[ q ];
						Av[ p + 1 ] = -Av[ q + 1 ];
						Av[ q ] = tempR;
						Av[ q + 1 ] = tempI;
					}

					p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					Av[ p + 1 ] = -Av[ p + 1 ];

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;

					// Swap A(k, k+1) <-> A(kp, k+1)
					p = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}

				k += 1;
				ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				kp = ( ~ip ) + 1;
				if ( kp !== k ) {
					if ( kp > 1 ) {
						zswap( kp - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( kp - 1 ) * strideA2 ) );
					}
					for ( j = kp + 1; j <= k - 1; j += 1 ) {
						p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
						q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
						tempR = Av[ p ];
						tempI = -Av[ p + 1 ];
						Av[ p ] = Av[ q ];
						Av[ p + 1 ] = -Av[ q + 1 ];
						Av[ q ] = tempR;
						Av[ q + 1 ] = tempI;
					}

					p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					Av[ p + 1 ] = -Av[ p + 1 ];

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}
			}

			k += 1;
		}
	} else {
		// Lower triangle: compute inv(A) from A = L*D*L**H
		k = N;

		while ( k >= 1 ) {
			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p ] = 1.0 / Av[ p ];
				Av[ p + 1 ] = 0.0;

				if ( k < N ) {
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					dotc = zdotc( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotc );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				t = cmplx.absAt( Av, q );

				p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				ak = Av[ p ] / t;

				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				akp1 = Av[ q ] / t;

				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				akkp1R = Av[ q ] / t;
				akkp1I = Av[ q + 1 ] / t;

				d = t * ( ( ak * akp1 ) - 1.0 );

				p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				Av[ p ] = akp1 / d;
				Av[ p + 1 ] = 0.0;

				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ q ] = ak / d;
				Av[ q + 1 ] = 0.0;

				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				Av[ q ] = -akkp1R / d;
				Av[ q + 1 ] = -akkp1I / d;

				if ( k < N ) {
					// Process column k
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );

					q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					dotc = zdotc( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					Av[ q ] -= real( dotc );

					dotc = zdotc( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );
					q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					Av[ q ] -= real( dotc );
					Av[ q + 1 ] -= imag( dotc );

					// Process column k-1
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );

					p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					dotc = zdotc( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );
					Av[ p ] -= real( dotc );
				}
				kstep = 2;
			}

			if ( kstep === 1 ) {
				// Interchange rows and columns K and IPIV(K) in the trailing submatrix
				kp = ip + 1;
				if ( kp !== k ) {
					if ( kp < N ) {
						zswap( N - kp, A, strideA1, offsetA + ( kp * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( kp * strideA1 ) + ( ( kp - 1 ) * strideA2 ) );
					}
					for ( j = k + 1; j <= kp - 1; j += 1 ) {
						p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
						q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
						tempR = Av[ p ];
						tempI = -Av[ p + 1 ];
						Av[ p ] = Av[ q ];
						Av[ p + 1 ] = -Av[ q + 1 ];
						Av[ q ] = tempR;
						Av[ q + 1 ] = tempI;
					}

					p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					Av[ p + 1 ] = -Av[ p + 1 ];

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}
			} else {
				// 2x2 pivot: swap K with -IPIV(K), then K-1 with -IPIV(K-1)
				kp = ( ~ip ) + 1;
				if ( kp !== k ) {
					if ( kp < N ) {
						zswap( N - kp, A, strideA1, offsetA + ( kp * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( kp * strideA1 ) + ( ( kp - 1 ) * strideA2 ) );
					}
					for ( j = k + 1; j <= kp - 1; j += 1 ) {
						p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
						q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
						tempR = Av[ p ];
						tempI = -Av[ p + 1 ];
						Av[ p ] = Av[ q ];
						Av[ p + 1 ] = -Av[ q + 1 ];
						Av[ q ] = tempR;
						Av[ q + 1 ] = tempI;
					}

					p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					Av[ p + 1 ] = -Av[ p + 1 ];

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;

					// Swap A(k, k-1) <-> A(kp, k-1)
					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}

				k -= 1;
				ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				kp = ( ~ip ) + 1;
				if ( kp !== k ) {
					if ( kp < N ) {
						zswap( N - kp, A, strideA1, offsetA + ( kp * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( kp * strideA1 ) + ( ( kp - 1 ) * strideA2 ) );
					}
					for ( j = k + 1; j <= kp - 1; j += 1 ) {
						p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
						q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
						tempR = Av[ p ];
						tempI = -Av[ p + 1 ];
						Av[ p ] = Av[ q ];
						Av[ p + 1 ] = -Av[ q + 1 ];
						Av[ q ] = tempR;
						Av[ q + 1 ] = tempI;
					}

					p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					Av[ p + 1 ] = -Av[ p + 1 ];

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}
			}

			k -= 1;
		}
	}

	return info;
}


// EXPORTS //

export default zhetriRook;
