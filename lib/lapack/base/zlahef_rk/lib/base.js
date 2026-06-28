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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var ALPHA_CONST = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* Computes CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - Float64 index of real part
* @returns {number} sum of absolute values of real and imaginary parts
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes a partial factorization of a complex Hermitian matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method, producing `_rk` format output.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (complex elements)
* @param {Complex128Array} e - output vector for 2x2 pivot off-diagonals
* @param {integer} strideE - stride for `e` (complex elements)
* @param {NonNegativeInteger} offsetE - index offset for `e` (complex elements)
* @param {Int32Array} IPIV - pivot index output array
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Complex128Array} W - workspace matrix (`N x nb`)
* @param {integer} strideW1 - stride of the first dimension of `W` (complex elements)
* @param {integer} strideW2 - stride of the second dimension of `W` (complex elements)
* @param {NonNegativeInteger} offsetW - index offset for `W` (complex elements)
* @returns {Object} result `{ info, kb }`
*/
function zlahefRk( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
	var wjkm1Re;
	var wjkm1Im;
	var absakk;
	var colmax;
	var rowmax;
	var wjkRe;
	var wjkIm;
	var kstep;
	var dtemp;
	var itemp;
	var d11Re;
	var d11Im;
	var d21Re;
	var d21Im;
	var d22Re;
	var d22Im;
	var done;
	var info;
	var imax;
	var jmax;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var kkw;
	var tRe;
	var aRe;
	var aIm;
	var nrm;
	var se;
	var ev;
	var si;
	var oe;
	var av;
	var wv;
	var oA;
	var oW;
	var kw;
	var kk;
	var kp;
	var jb;
	var jj;
	var r1;
	var tt;
	var ii;
	var p;
	var k;
	var j;

	av = reinterpret( A, 0 );
	wv = reinterpret( W, 0 );
	ev = reinterpret( e, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw1 = strideW1 * 2;
	sw2 = strideW2 * 2;
	se = strideE * 2;
	si = strideIPIV;
	oA = offsetA * 2;
	oW = offsetW * 2;
	oe = offsetE * 2;

	info = 0;

	if ( uplo === 'upper' ) {
		ev[ oe ] = 0.0;
		ev[ oe + 1 ] = 0.0;

		k = N - 1;
		while ( true ) {
			kw = nb + k - N;

			if ( ( k <= N - nb && nb < N ) || k < 0 ) {
				break;
			}

			kstep = 1;
			p = k;

			if ( k > 0 ) {
				zcopy( k, A, strideA1, offsetA + ( k * strideA2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
			}
			wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
			wv[ oW + ( k * sw1 ) + ( kw * sw2 ) + 1 ] = 0.0;

			if ( k < N - 1 ) {
				zgemv( 'no-transpose', k + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( k * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, W, strideW1, offsetW + ( kw * strideW2 ) );
				wv[ oW + ( k * sw1 ) + ( kw * sw2 ) + 1 ] = 0.0;
			}

			absakk = Math.abs( wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ] );

			if ( k > 0 ) {
				imax = izamax( k, W, strideW1, offsetW + ( kw * strideW2 ) );
				colmax = cabs1( wv, oW + ( imax * sw1 ) + ( kw * sw2 ) );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;

				av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
				av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
				if ( k > 0 ) {
					zcopy( k, W, strideW1, offsetW + ( kw * strideW2 ), A, strideA1, offsetA + ( k * strideA2 ) );
				}

				if ( k > 0 ) {
					ev[ oe + ( k * se ) ] = 0.0;
					ev[ oe + ( k * se ) + 1 ] = 0.0;
				}
			} else {
				if ( absakk >= ALPHA_CONST * colmax ) {
					kp = k;
				} else {
					done = false;

					while ( true ) {
						if ( imax > 0 ) {
							zcopy( imax, A, strideA1, offsetA + ( imax * strideA2 ), W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
						}
						wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) ] = av[ oA + ( imax * sa1 ) + ( imax * sa2 ) ];
						wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ] = 0.0;

						zcopy( k - imax, A, strideA2, offsetA + ( imax * strideA1 ) + ( ( imax + 1 ) * strideA2 ), W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( kw - 1 ) * strideW2 ) );
						zlacgv( k - imax, W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( kw - 1 ) * strideW2 ) );

						if ( k < N - 1 ) {
							zgemv( 'no-transpose', k + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( imax * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
							wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ] = 0.0;
						}

						if ( imax === k ) {
							rowmax = 0.0;
						} else {
							jmax = imax + 1 + izamax( k - imax, W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( kw - 1 ) * strideW2 ) );
							rowmax = cabs1( wv, oW + ( jmax * sw1 ) + ( ( kw - 1 ) * sw2 ) );
						}

						if ( imax > 0 ) {
							itemp = izamax( imax, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
							dtemp = cabs1( wv, oW + ( itemp * sw1 ) + ( ( kw - 1 ) * sw2 ) );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						if ( Math.abs( wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) ] ) >= ALPHA_CONST * rowmax ) {
							kp = imax;
							zcopy( k + 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
							zcopy( k + 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
						}

						if ( done ) {
							break;
						}
					}
				}

				kk = k - kstep + 1;
				kkw = nb + kk - N;

				if ( kstep === 2 && p !== k ) {
					av[ oA + ( p * sa1 ) + ( p * sa2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
					av[ oA + ( p * sa1 ) + ( p * sa2 ) + 1 ] = 0.0;

					zcopy( k - 1 - p, A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( p + 1 ) * strideA2 ) );
					zlacgv( k - 1 - p, A, strideA2, offsetA + ( p * strideA1 ) + ( ( p + 1 ) * strideA2 ) );

					if ( p > 0 ) {
						zcopy( p, A, strideA1, offsetA + ( k * strideA2 ), A, strideA1, offsetA + ( p * strideA2 ) );
					}

					if ( k < N - 1 ) {
						zswap( N - 1 - k, A, strideA2, offsetA + ( k * strideA1 ) + ( ( k + 1 ) * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( k + 1 ) * strideA2 ) );
					}
					zswap( N - kk, W, strideW2, offsetW + ( k * strideW1 ) + ( kkw * strideW2 ), W, strideW2, offsetW + ( p * strideW1 ) + ( kkw * strideW2 ) );
				}

				if ( kp !== kk ) {
					av[ oA + ( kp * sa1 ) + ( kp * sa2 ) ] = av[ oA + ( kk * sa1 ) + ( kk * sa2 ) ];
					av[ oA + ( kp * sa1 ) + ( kp * sa2 ) + 1 ] = 0.0;

					zcopy( kk - 1 - kp, A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kp + 1 ) * strideA2 ) );
					zlacgv( kk - 1 - kp, A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kp + 1 ) * strideA2 ) );

					if ( kp > 0 ) {
						zcopy( kp, A, strideA1, offsetA + ( kk * strideA2 ), A, strideA1, offsetA + ( kp * strideA2 ) );
					}

					if ( k < N - 1 ) {
						zswap( N - 1 - k, A, strideA2, offsetA + ( kk * strideA1 ) + ( ( k + 1 ) * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( k + 1 ) * strideA2 ) );
					}
					zswap( N - kk, W, strideW2, offsetW + ( kk * strideW1 ) + ( kkw * strideW2 ), W, strideW2, offsetW + ( kp * strideW1 ) + ( kkw * strideW2 ) );
				}

				if ( kstep === 1 ) {
					zcopy( k + 1, W, strideW1, offsetW + ( kw * strideW2 ), A, strideA1, offsetA + ( k * strideA2 ) );
					if ( k > 0 ) {
						tt = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
						if ( Math.abs( tt ) >= SFMIN ) {
							r1 = 1.0 / tt;
							zdscal( k, r1, A, strideA1, offsetA + ( k * strideA2 ) );
						} else {
							for ( ii = 0; ii < k; ii++ ) {
								aRe = av[ oA + ( ii * sa1 ) + ( k * sa2 ) ];
								aIm = av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ];
								av[ oA + ( ii * sa1 ) + ( k * sa2 ) ] = aRe / tt;
								av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ] = aIm / tt;
							}
						}

						zlacgv( k, W, strideW1, offsetW + ( kw * strideW2 ) );

						ev[ oe + ( k * se ) ] = 0.0;
						ev[ oe + ( k * se ) + 1 ] = 0.0;
					}
				} else {
					if ( k > 1 ) {
						d21Re = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
						d21Im = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) + 1 ];
						nrm = ( d21Re * d21Re ) + ( d21Im * d21Im );

						// D11 = W(k, kw) / conj(D21); W(k,kw) is real
						tt = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
						d11Re = ( tt * d21Re ) / nrm;
						d11Im = ( tt * d21Im ) / nrm;

						// D22 = W(k-1, kw-1) / D21; W(k-1,kw-1) is real
						tt = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
						d22Re = ( tt * d21Re ) / nrm;
						d22Im = ( -tt * d21Im ) / nrm;

						// T = 1 / (real(D11*D22) - 1)
						tRe = ( d11Re * d22Re ) - ( d11Im * d22Im );
						tt = 1.0 / ( tRe - 1.0 );

						for ( j = 0; j <= k - 2; j++ ) {
							wjkm1Re = wv[ oW + ( j * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
							wjkm1Im = wv[ oW + ( j * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ];
							wjkRe = wv[ oW + ( j * sw1 ) + ( kw * sw2 ) ];
							wjkIm = wv[ oW + ( j * sw1 ) + ( kw * sw2 ) + 1 ];

							// A(j, k-1) = T * (D11*W(j,kw-1) - W(j,kw)) / D21
							aRe = ( d11Re * wjkm1Re ) - ( d11Im * wjkm1Im );
							aIm = ( d11Re * wjkm1Im ) + ( d11Im * wjkm1Re );
							aRe -= wjkRe;
							aIm -= wjkIm;

							// Divide by D21 = (d21Re, d21Im): (a * conj(D21)) / |D21|^2
							av[ oA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) ] = tt * ( ( ( aRe * d21Re ) + ( aIm * d21Im ) ) / nrm );
							av[ oA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) + 1 ] = tt * ( ( ( aIm * d21Re ) - ( aRe * d21Im ) ) / nrm );

							// A(j, k) = T * (D22*W(j,kw) - W(j,kw-1)) / conj(D21)
							aRe = ( d22Re * wjkRe ) - ( d22Im * wjkIm );
							aIm = ( d22Re * wjkIm ) + ( d22Im * wjkRe );
							aRe -= wjkm1Re;
							aIm -= wjkm1Im;

							// Divide by conj(D21) = (d21Re, -d21Im): (a * D21) / |D21|^2
							av[ oA + ( j * sa1 ) + ( k * sa2 ) ] = tt * ( ( ( aRe * d21Re ) - ( aIm * d21Im ) ) / nrm );
							av[ oA + ( j * sa1 ) + ( k * sa2 ) + 1 ] = tt * ( ( ( aRe * d21Im ) + ( aIm * d21Re ) ) / nrm );
						}
					}

					av[ oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
					av[ oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) + 1 ] = 0.0;
					av[ oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] = 0.0;
					av[ oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
					av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
					av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;

					ev[ oe + ( k * se ) ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
					ev[ oe + ( k * se ) + 1 ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) + 1 ];
					ev[ oe + ( ( k - 1 ) * se ) ] = 0.0;
					ev[ oe + ( ( k - 1 ) * se ) + 1 ] = 0.0;

					zlacgv( k, W, strideW1, offsetW + ( kw * strideW2 ) );
					if ( k - 1 > 0 ) {
						zlacgv( k - 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
					}
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( k * si ) ] = kp;
			} else {
				IPIV[ offsetIPIV + ( k * si ) ] = ~p;
				IPIV[ offsetIPIV + ( ( k - 1 ) * si ) ] = ~kp;
			}

			k -= kstep;
		}

		for ( j = ( Math.floor( k / nb ) ) * nb; j >= 0; j -= nb ) {
			jb = Math.min( nb, k - j + 1 );

			for ( jj = j; jj < j + jb; jj++ ) {
				av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
				zgemv( 'no-transpose', jj - j + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( jj * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, A, strideA1, offsetA + ( j * strideA1 ) + ( jj * strideA2 ) );
				av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
			}

			if ( j >= 1 ) {
				zgemm( 'no-transpose', 'transpose', j, jb, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW1, strideW2, offsetW + ( j * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, A, strideA1, strideA2, offsetA + ( j * strideA2 ) );
			}
		}

		return {
			'info': info,
			'kb': N - 1 - k
		};
	}

	// Lower case
	ev[ oe + ( ( N - 1 ) * se ) ] = 0.0;
	ev[ oe + ( ( N - 1 ) * se ) + 1 ] = 0.0;

	k = 0;
	while ( true ) {
		if ( ( k >= nb - 1 && nb < N ) || k >= N ) {
			break;
		}

		kstep = 1;
		p = k;

		wv[ oW + ( k * sw1 ) + ( k * sw2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
		wv[ oW + ( k * sw1 ) + ( k * sw2 ) + 1 ] = 0.0;
		if ( k < N - 1 ) {
			zcopy( N - 1 - k, A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ), W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
		}
		if ( k > 0 ) {
			zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ), W, strideW2, offsetW + ( k * strideW1 ), CONE, W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
			wv[ oW + ( k * sw1 ) + ( k * sw2 ) + 1 ] = 0.0;
		}

		absakk = Math.abs( wv[ oW + ( k * sw1 ) + ( k * sw2 ) ] );

		if ( k < N - 1 ) {
			imax = k + 1 + izamax( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
			colmax = cabs1( wv, oW + ( imax * sw1 ) + ( k * sw2 ) );
		} else {
			colmax = 0.0;
		}

		if ( Math.max( absakk, colmax ) === 0.0 ) {
			if ( info === 0 ) {
				info = k + 1;
			}
			kp = k;

			av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
			av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
			if ( k < N - 1 ) {
				zcopy( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ), A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ) );
			}

			if ( k < N - 1 ) {
				ev[ oe + ( k * se ) ] = 0.0;
				ev[ oe + ( k * se ) + 1 ] = 0.0;
			}
		} else {
			if ( absakk >= ALPHA_CONST * colmax ) {
				kp = k;
			} else {
				done = false;

				while ( true ) {
					zcopy( imax - k, A, strideA2, offsetA + ( imax * strideA1 ) + ( k * strideA2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
					zlacgv( imax - k, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
					wv[ oW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) ] = av[ oA + ( imax * sa1 ) + ( imax * sa2 ) ];
					wv[ oW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) + 1 ] = 0.0;

					if ( imax < N - 1 ) {
						zcopy( N - 1 - imax, A, strideA1, offsetA + ( ( imax + 1 ) * strideA1 ) + ( imax * strideA2 ), W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
					}

					if ( k > 0 ) {
						zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ), W, strideW2, offsetW + ( imax * strideW1 ), CONE, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
						wv[ oW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) + 1 ] = 0.0;
					}

					if ( imax === k ) {
						rowmax = 0.0;
					} else {
						jmax = k + izamax( imax - k, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
						rowmax = cabs1( wv, oW + ( jmax * sw1 ) + ( ( k + 1 ) * sw2 ) );
					}

					if ( imax < N - 1 ) {
						itemp = imax + 1 + izamax( N - 1 - imax, W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
						dtemp = cabs1( wv, oW + ( itemp * sw1 ) + ( ( k + 1 ) * sw2 ) );
						if ( dtemp > rowmax ) {
							rowmax = dtemp;
							jmax = itemp;
						}
					}

					if ( Math.abs( wv[ oW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) ] ) >= ALPHA_CONST * rowmax ) {
						kp = imax;
						zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
						done = true;
					} else if ( p === jmax || rowmax <= colmax ) {
						kp = imax;
						kstep = 2;
						done = true;
					} else {
						p = imax;
						colmax = rowmax;
						imax = jmax;
						zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
					}

					if ( done ) {
						break;
					}
				}
			}

			kk = k + kstep - 1;

			if ( kstep === 2 && p !== k ) {
				av[ oA + ( p * sa1 ) + ( p * sa2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
				av[ oA + ( p * sa1 ) + ( p * sa2 ) + 1 ] = 0.0;

				zcopy( p - k - 1, A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( k + 1 ) * strideA2 ) );
				zlacgv( p - k - 1, A, strideA2, offsetA + ( p * strideA1 ) + ( ( k + 1 ) * strideA2 ) );

				if ( p < N - 1 ) {
					zcopy( N - 1 - p, A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( p * strideA2 ) );
				}

				if ( k > 0 ) {
					zswap( k, A, strideA2, offsetA + ( k * strideA1 ), A, strideA2, offsetA + ( p * strideA1 ) );
				}
				zswap( kk + 1, W, strideW2, offsetW + ( k * strideW1 ), W, strideW2, offsetW + ( p * strideW1 ) );
			}

			if ( kp !== kk ) {
				av[ oA + ( kp * sa1 ) + ( kp * sa2 ) ] = av[ oA + ( kk * sa1 ) + ( kk * sa2 ) ];
				av[ oA + ( kp * sa1 ) + ( kp * sa2 ) + 1 ] = 0.0;

				zcopy( kp - kk - 1, A, strideA1, offsetA + ( ( kk + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kk + 1 ) * strideA2 ) );
				zlacgv( kp - kk - 1, A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kk + 1 ) * strideA2 ) );

				if ( kp < N - 1 ) {
					zcopy( N - 1 - kp, A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kp * strideA2 ) );
				}

				if ( k > 0 ) {
					zswap( k, A, strideA2, offsetA + ( kk * strideA1 ), A, strideA2, offsetA + ( kp * strideA1 ) );
				}
				zswap( kk + 1, W, strideW2, offsetW + ( kk * strideW1 ), W, strideW2, offsetW + ( kp * strideW1 ) );
			}

			if ( kstep === 1 ) {
				zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( k * strideA2 ) );
				if ( k < N - 1 ) {
					tt = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
					if ( Math.abs( tt ) >= SFMIN ) {
						r1 = 1.0 / tt;
						zdscal( N - 1 - k, r1, A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ) );
					} else {
						for ( ii = k + 1; ii < N; ii++ ) {
							aRe = av[ oA + ( ii * sa1 ) + ( k * sa2 ) ];
							aIm = av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ];
							av[ oA + ( ii * sa1 ) + ( k * sa2 ) ] = aRe / tt;
							av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ] = aIm / tt;
						}
					}

					zlacgv( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );

					ev[ oe + ( k * se ) ] = 0.0;
					ev[ oe + ( k * se ) + 1 ] = 0.0;
				}
			} else {
				if ( k < N - 2 ) {
					d21Re = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
					d21Im = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) + 1 ];
					nrm = ( d21Re * d21Re ) + ( d21Im * d21Im );

					// D11 = W(k+1, k+1) / D21; W(k+1,k+1) real
					tt = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
					d11Re = ( tt * d21Re ) / nrm;
					d11Im = ( -tt * d21Im ) / nrm;

					// D22 = W(k, k) / conj(D21); W(k,k) real
					tt = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
					d22Re = ( tt * d21Re ) / nrm;
					d22Im = ( tt * d21Im ) / nrm;

					// T = 1 / (real(D11*D22) - 1)
					tRe = ( d11Re * d22Re ) - ( d11Im * d22Im );
					tt = 1.0 / ( tRe - 1.0 );

					for ( j = k + 2; j < N; j++ ) {
						wjkRe = wv[ oW + ( j * sw1 ) + ( k * sw2 ) ];
						wjkIm = wv[ oW + ( j * sw1 ) + ( k * sw2 ) + 1 ];
						wjkm1Re = wv[ oW + ( j * sw1 ) + ( ( k + 1 ) * sw2 ) ];
						wjkm1Im = wv[ oW + ( j * sw1 ) + ( ( k + 1 ) * sw2 ) + 1 ];

						// A(j, k) = T * (D11*W(j,k) - W(j,k+1)) / conj(D21)
						aRe = ( d11Re * wjkRe ) - ( d11Im * wjkIm );
						aIm = ( d11Re * wjkIm ) + ( d11Im * wjkRe );
						aRe -= wjkm1Re;
						aIm -= wjkm1Im;

						// Divide by conj(D21): (a * D21) / |D21|^2
						av[ oA + ( j * sa1 ) + ( k * sa2 ) ] = tt * ( ( ( aRe * d21Re ) - ( aIm * d21Im ) ) / nrm );
						av[ oA + ( j * sa1 ) + ( k * sa2 ) + 1 ] = tt * ( ( ( aRe * d21Im ) + ( aIm * d21Re ) ) / nrm );

						// A(j, k+1) = T * (D22*W(j,k+1) - W(j,k)) / D21
						aRe = ( d22Re * wjkm1Re ) - ( d22Im * wjkm1Im );
						aIm = ( d22Re * wjkm1Im ) + ( d22Im * wjkm1Re );
						aRe -= wjkRe;
						aIm -= wjkIm;

						// Divide by D21: (a * conj(D21)) / |D21|^2
						av[ oA + ( j * sa1 ) + ( ( k + 1 ) * sa2 ) ] = tt * ( ( ( aRe * d21Re ) + ( aIm * d21Im ) ) / nrm );
						av[ oA + ( j * sa1 ) + ( ( k + 1 ) * sa2 ) + 1 ] = tt * ( ( ( aIm * d21Re ) - ( aRe * d21Im ) ) / nrm );
					}
				}

				av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
				av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
				av[ oA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) ] = 0.0;
				av[ oA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
				av[ oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) + 1 ] = 0.0;

				ev[ oe + ( k * se ) ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
				ev[ oe + ( k * se ) + 1 ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) + 1 ];
				ev[ oe + ( ( k + 1 ) * se ) ] = 0.0;
				ev[ oe + ( ( k + 1 ) * se ) + 1 ] = 0.0;

				zlacgv( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
				if ( N - 2 - k > 0 ) {
					zlacgv( N - 2 - k, W, strideW1, offsetW + ( ( k + 2 ) * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
				}
			}
		}

		if ( kstep === 1 ) {
			IPIV[ offsetIPIV + ( k * si ) ] = kp;
		} else {
			IPIV[ offsetIPIV + ( k * si ) ] = ~p;
			IPIV[ offsetIPIV + ( ( k + 1 ) * si ) ] = ~kp;
		}

		k += kstep;
	}

	for ( j = k; j < N; j += nb ) {
		jb = Math.min( nb, N - j );

		for ( jj = j; jj < j + jb; jj++ ) {
			av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
			zgemv( 'no-transpose', j + jb - jj, k, NEGCONE, A, strideA1, strideA2, offsetA + ( jj * strideA1 ), W, strideW2, offsetW + ( jj * strideW1 ), CONE, A, strideA1, offsetA + ( jj * strideA1 ) + ( jj * strideA2 ) );
			av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
		}

		if ( j + jb < N ) {
			zgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ), W, strideW1, strideW2, offsetW + ( j * strideW1 ), CONE, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ) + ( j * strideA2 ) );
		}
	}

	return {
		'info': info,
		'kb': k
	};
}


// EXPORTS //

export default zlahefRk;
