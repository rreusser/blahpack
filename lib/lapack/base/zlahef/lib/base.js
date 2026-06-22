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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
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
* Computes a partial factorization of a complex Hermitian matrix A using the
* Bunch-Kaufman diagonal pivoting method. This is the blocked panel
* factorization used by zhetrf.
*
* Note: This is HERMITIAN factorization (not symmetric). The factorization
* uses conjugate-transpose (A**H), not plain transpose (A**T).
* Diagonal elements are real.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Complex128Array} A - input/output Hermitian matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Complex128Array} W - workspace matrix, dimensions N x NB
* @param {integer} strideW1 - stride of the first dimension of W (complex elements)
* @param {integer} strideW2 - stride of the second dimension of W (complex elements)
* @param {NonNegativeInteger} offsetW - index offset for W (complex elements)
* @returns {Object} result - { info, kb } where info=0 on success, kb=columns factored
*/
function zlahef( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
	var wjkm1Re;
	var wjkm1Im;
	var absakk;
	var colmax;
	var rowmax;
	var wjkRe;
	var wjkIm;
	var kstep;
	var d11Re;
	var d11Im;
	var d21Re;
	var d21Im;
	var d22Re;
	var d22Im;
	var info;
	var imax;
	var jmax;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var kkw;
	var tRe;
	var tIm;
	var aRe;
	var aIm;
	var av;
	var wv;
	var oA;
	var oW;
	var kw;
	var kk;
	var kp;
	var jb;
	var jj;
	var jp;
	var r1;
	var tt;
	var k;
	var j;

	av = reinterpret( A, 0 );
	wv = reinterpret( W, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw1 = strideW1 * 2;
	sw2 = strideW2 * 2;
	oA = offsetA * 2;
	oW = offsetW * 2;

	info = 0;

	if ( uplo === 'upper' ) {
		// Factorize the trailing columns of A using the upper triangle
		k = N - 1;
		while ( true ) {
			kw = nb + k - N;

			if ( ( k <= N - nb && nb < N ) || k < 0 ) {
				break;
			}

			kstep = 1;

			// Copy column k of A into column kw of W and update
			// Copy upper part: A(0:k-1, k) -> W(0:k-1, kw)
			zcopy( k, A, strideA1, offsetA + (k * strideA2), W, strideW1, offsetW + (kw * strideW2) );
			// W(k, kw) = real(A(k,k))
			wv[ oW + (k * sw1) + (kw * sw2) ] = av[ oA + (k * sa1) + (k * sa2) ];
			wv[ oW + (k * sw1) + (kw * sw2) + 1 ] = 0.0;

			if ( k < N - 1 ) {
				// W(:, kw) -= A(:, k+1:N-1) * W(k, kw+1:nb-1)^T
				zgemv( 'no-transpose', k + 1, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA2), W, strideW2, offsetW + (k * strideW1) + (( kw + 1 ) * strideW2), CONE, W, strideW1, offsetW + (kw * strideW2) );
				// Force W(k,kw) real
				wv[ oW + (k * sw1) + (kw * sw2) + 1 ] = 0.0;
			}

			// ABSAKK = |real(W(k, kw))|
			absakk = Math.abs( wv[ oW + (k * sw1) + (kw * sw2) ] );

			if ( k > 0 ) {
				imax = izamax( k, W, strideW1, offsetW + (kw * strideW2) );
				colmax = cabs1( wv, oW + (imax * sw1) + (kw * sw2) );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				// Force A(k,k) real
				av[ oA + (k * sa1) + (k * sa2) + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Copy column imax of A into column kw-1 of W and update
					zcopy( imax, A, strideA1, offsetA + (imax * strideA2), W, strideW1, offsetW + (( kw - 1 ) * strideW2) );
					// W(imax, kw-1) = real(A(imax, imax))
					wv[ oW + (imax * sw1) + (( kw - 1 ) * sw2) ] = av[ oA + (imax * sa1) + (imax * sa2) ];
					wv[ oW + (imax * sw1) + (( kw - 1 ) * sw2) + 1 ] = 0.0;
					// Copy row imax from column imax+1 to k (using LDA stride) and conjugate
					zcopy( k - imax, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2), W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( kw - 1 ) * strideW2) );
					zlacgv( k - imax, W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( kw - 1 ) * strideW2) );

					if ( k < N - 1 ) {
						zgemv( 'no-transpose', k + 1, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA2), W, strideW2, offsetW + (imax * strideW1) + (( kw + 1 ) * strideW2), CONE, W, strideW1, offsetW + (( kw - 1 ) * strideW2) );
						// Force W(imax, kw-1) real
						wv[ oW + (imax * sw1) + (( kw - 1 ) * sw2) + 1 ] = 0.0;
					}

					jmax = imax + 1 + izamax( k - imax - 1, W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( kw - 1 ) * strideW2) );
					rowmax = cabs1( wv, oW + (jmax * sw1) + (( kw - 1 ) * sw2) );
					if ( imax > 0 ) {
						jmax = izamax( imax, W, strideW1, offsetW + (( kw - 1 ) * strideW2) );
						rowmax = Math.max( rowmax, cabs1( wv, oW + (jmax * sw1) + (( kw - 1 ) * sw2) ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else if ( Math.abs( wv[ oW + (imax * sw1) + (( kw - 1 ) * sw2) ] ) >= ALPHA * rowmax ) {
						kp = imax;
						// Copy column kw-1 of W into column kw of W
						zcopy( k + 1, W, strideW1, offsetW + (( kw - 1 ) * strideW2), W, strideW1, offsetW + (kw * strideW2) );
					} else {
						kp = imax;
						kstep = 2;
					}
				}

				kk = k - kstep + 1;
				kkw = nb + kk - N;

				if ( kp !== kk ) {
					// Interchange rows and columns kp and kk
					// A(kp, kp) = real(A(kk, kk))
					av[ oA + (kp * sa1) + (kp * sa2) ] = av[ oA + (kk * sa1) + (kk * sa2) ];
					av[ oA + (kp * sa1) + (kp * sa2) + 1 ] = 0.0;

					// Copy and conjugate entries between kp+1 and kk-1
					zcopy( kk - 1 - kp, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kp + 1 ) * strideA2) );
					zlacgv( kk - 1 - kp, A, strideA2, offsetA + (kp * strideA1) + (( kp + 1 ) * strideA2) );

					if ( kp > 0 ) {
						zcopy( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}

					// Swap rows in trailing columns
					if ( k < N - 1 ) {
						zswap( N - k - 1, A, strideA2, offsetA + (kk * strideA1) + (( k + 1 ) * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( k + 1 ) * strideA2) );
					}
					zswap( N - kk, W, strideW2, offsetW + (kk * strideW1) + (kkw * strideW2), W, strideW2, offsetW + (kp * strideW1) + (kkw * strideW2) );
				}

				if ( kstep === 1 ) {
					// 1x1 pivot: copy W(kw) back into A(k) and scale
					zcopy( k + 1, W, strideW1, offsetW + (kw * strideW2), A, strideA1, offsetA + (k * strideA2) );
					if ( k > 0 ) {
						r1 = 1.0 / av[ oA + (k * sa1) + (k * sa2) ];
						zdscal( k, r1, A, strideA1, offsetA + (k * strideA2) );

						// Conjugate W(:, kw)
						zlacgv( k, W, strideW1, offsetW + (kw * strideW2) );
					}
				} else {
					// 2x2 pivot block
					if ( k > 1 ) {
						// D21 = W(k-1, kw) — complex
						d21Re = wv[ oW + (( k - 1 ) * sw1) + (kw * sw2) ];
						d21Im = wv[ oW + (( k - 1 ) * sw1) + (kw * sw2) + 1 ];

						// D11 = W(k, kw) / conj(D21)  — D11 is real since W(k,kw) is real
						// W(k,kw) is real, conj(D21) = (d21Re, -d21Im)
						// real / complex = complex
						tt = wv[ oW + (k * sw1) + (kw * sw2) ];
						tRe = d21Re;
						tIm = -d21Im;
						// tt / (tRe + i*tIm)
						d11Re = ( tt * tRe ) / ( tRe * tRe + tIm * tIm );
						d11Im = ( -tt * tIm ) / ( tRe * tRe + tIm * tIm );

						// D22 = W(k-1, kw-1) / D21  — D22 is real
						tt = wv[ oW + (( k - 1 ) * sw1) + (( kw - 1 ) * sw2) ];
						d22Re = ( tt * d21Re ) / ( d21Re * d21Re + d21Im * d21Im );
						d22Im = ( -tt * d21Im ) / ( d21Re * d21Re + d21Im * d21Im );

						// T = 1 / (real(D11*D22) - 1)
						// D11*D22:
						tRe = (d11Re * d22Re) - (d11Im * d22Im);
						// tRe should be real since both D11 and D22 have matching imaginary cancellation
						tt = 1.0 / ( tRe - 1.0 );

						// D21 = T / D21
						// T is real, so T / D21 = T * conj(D21) / |D21|^2
						tRe = ( tt * d21Re ) / ( d21Re * d21Re + d21Im * d21Im );
						tIm = ( -tt * d21Im ) / ( d21Re * d21Re + d21Im * d21Im );
						d21Re = tRe;
						d21Im = tIm;

						for ( j = 0; j <= k - 2; j++ ) {
							wjkm1Re = wv[ oW + (j * sw1) + (( kw - 1 ) * sw2) ];
							wjkm1Im = wv[ oW + (j * sw1) + (( kw - 1 ) * sw2) + 1 ];
							wjkRe = wv[ oW + (j * sw1) + (kw * sw2) ];
							wjkIm = wv[ oW + (j * sw1) + (kw * sw2) + 1 ];

							// A(j, k-1) = D21 * (D11*W(j,kw-1) - W(j,kw))
							aRe = (d11Re * wjkm1Re) - (d11Im * wjkm1Im);
							aIm = (d11Re * wjkm1Im) + (d11Im * wjkm1Re);
							aRe -= wjkRe;
							aIm -= wjkIm;
							av[ oA + (j * sa1) + (( k - 1 ) * sa2) ] = (d21Re * aRe) - (d21Im * aIm);
							av[ oA + (j * sa1) + (( k - 1 ) * sa2) + 1 ] = (d21Re * aIm) + (d21Im * aRe);

							// A(j, k) = conj(D21) * (D22*W(j,kw) - W(j,kw-1))
							aRe = (d22Re * wjkRe) - (d22Im * wjkIm);
							aIm = (d22Re * wjkIm) + (d22Im * wjkRe);
							aRe -= wjkm1Re;
							aIm -= wjkm1Im;
							// conj(D21) = (d21Re, -d21Im)
							av[ oA + (j * sa1) + (k * sa2) ] = (d21Re * aRe) + (d21Im * aIm);
							av[ oA + (j * sa1) + (k * sa2) + 1 ] = (d21Re * aIm) - (d21Im * aRe);
						}
					}

					// Copy D(k) back into A
					av[ oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) ] = wv[ oW + (( k - 1 ) * sw1) + (( kw - 1 ) * sw2) ];
					av[ oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) + 1 ] = 0.0;
					av[ oA + (( k - 1 ) * sa1) + (k * sa2) ] = wv[ oW + (( k - 1 ) * sw1) + (kw * sw2) ];
					av[ oA + (( k - 1 ) * sa1) + (k * sa2) + 1 ] = wv[ oW + (( k - 1 ) * sw1) + (kw * sw2) + 1 ];
					av[ oA + (k * sa1) + (k * sa2) ] = wv[ oW + (k * sw1) + (kw * sw2) ];
					av[ oA + (k * sa1) + (k * sa2) + 1 ] = 0.0;

					// Conjugate W columns
					zlacgv( k, W, strideW1, offsetW + (kw * strideW2) );
					zlacgv( k - 1, W, strideW1, offsetW + (( kw - 1 ) * strideW2) );
				}
			}

			// Store IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}

		// Update the upper triangle: apply pending updates from W
		for ( j = Math.floor( k / nb ) * nb; j >= 0; j -= nb ) {
			jb = Math.min( nb, k - j + 1 );

			for ( jj = j; jj < j + jb; jj++ ) {
				// Force diagonal real before update
				av[ oA + (jj * sa1) + (jj * sa2) + 1 ] = 0.0;
				zgemv( 'no-transpose', jj - j + 1, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (j * strideA1) + (( k + 1 ) * strideA2), W, strideW2, offsetW + (jj * strideW1) + (( kw + 1 ) * strideW2), CONE, A, strideA1, offsetA + (j * strideA1) + (jj * strideA2) );
				av[ oA + (jj * sa1) + (jj * sa2) + 1 ] = 0.0;
			}

			zgemm( 'no-transpose', 'transpose', j, jb, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA2), W, strideW1, strideW2, offsetW + (j * strideW1) + (( kw + 1 ) * strideW2), CONE, A, strideA1, strideA2, offsetA + (j * strideA2) );
		}

		// Apply pending row swaps
		j = k + 1;
		while ( j < N ) {
			jj = j;
			jp = IPIV[ offsetIPIV + (j * strideIPIV) ];
			if ( jp < 0 ) {
				jp = ~jp;
				j += 1;
			}
			j += 1;
			if ( jp !== jj && j < N ) {
				zswap( N - j, A, strideA2, offsetA + (jp * strideA1) + (j * strideA2), A, strideA2, offsetA + (jj * strideA1) + (j * strideA2) );
			}
		}

		return {
			'info': info,
			'kb': N - k - 1
		};
	}

	// Lower case: factorize the leading columns of A
	k = 0;
	while ( true ) {
		if ( ( k >= nb - 1 && nb < N ) || k >= N ) {
			break;
		}

		kstep = 1;

		// Copy column k of A into column k of W and update
		// W(k, k) = real(A(k,k))
		wv[ oW + (k * sw1) + (k * sw2) ] = av[ oA + (k * sa1) + (k * sa2) ];
		wv[ oW + (k * sw1) + (k * sw2) + 1 ] = 0.0;
		if ( k < N - 1 ) {
			zcopy( N - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), W, strideW1, offsetW + (( k + 1 ) * strideW1) + (k * strideW2) );
		}
		zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + (k * strideA1), W, strideW2, offsetW + (k * strideW1), CONE, W, strideW1, offsetW + (k * strideW1) + (k * strideW2) );
		// Force W(k,k) real
		wv[ oW + (k * sw1) + (k * sw2) + 1 ] = 0.0;

		absakk = Math.abs( wv[ oW + (k * sw1) + (k * sw2) ] );

		if ( k < N - 1 ) {
			imax = k + 1 + izamax( N - k - 1, W, strideW1, offsetW + (( k + 1 ) * strideW1) + (k * strideW2) );
			colmax = cabs1( wv, oW + (imax * sw1) + (k * sw2) );
		} else {
			colmax = 0.0;
		}

		if ( Math.max( absakk, colmax ) === 0.0 ) {
			if ( info === 0 ) {
				info = k + 1;
			}
			kp = k;
			av[ oA + (k * sa1) + (k * sa2) + 1 ] = 0.0;
		} else {
			if ( absakk >= ALPHA * colmax ) {
				kp = k;
			} else {
				// Copy row imax into column k+1 of W and update
				// Copy A(imax, k:imax-1) into W(k:imax-1, k+1) and conjugate
				zcopy( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2), W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2) );
				zlacgv( imax - k, W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2) );
				// W(imax, k+1) = real(A(imax, imax))
				wv[ oW + (imax * sw1) + (( k + 1 ) * sw2) ] = av[ oA + (imax * sa1) + (imax * sa2) ];
				wv[ oW + (imax * sw1) + (( k + 1 ) * sw2) + 1 ] = 0.0;
				if ( imax < N - 1 ) {
					zcopy( N - imax - 1, A, strideA1, offsetA + (( imax + 1 ) * strideA1) + (imax * strideA2), W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( k + 1 ) * strideW2) );
				}
				zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + (k * strideA1), W, strideW2, offsetW + (imax * strideW1), CONE, W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2) );
				// Force W(imax, k+1) real
				wv[ oW + (imax * sw1) + (( k + 1 ) * sw2) + 1 ] = 0.0;

				jmax = k + izamax( imax - k, W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2) );
				rowmax = cabs1( wv, oW + (jmax * sw1) + (( k + 1 ) * sw2) );
				if ( imax < N - 1 ) {
					jmax = imax + 1 + izamax( N - imax - 1, W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( k + 1 ) * strideW2) );
					rowmax = Math.max( rowmax, cabs1( wv, oW + (jmax * sw1) + (( k + 1 ) * sw2) ) );
				}

				if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
					kp = k;
				} else if ( Math.abs( wv[ oW + (imax * sw1) + (( k + 1 ) * sw2) ] ) >= ALPHA * rowmax ) {
					kp = imax;
					// Copy column k+1 of W into column k of W
					zcopy( N - k, W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2), W, strideW1, offsetW + (k * strideW1) + (k * strideW2) );
				} else {
					kp = imax;
					kstep = 2;
				}
			}

			kk = k + kstep - 1;

			if ( kp !== kk ) {
				// Interchange rows and columns kp and kk
				av[ oA + (kp * sa1) + (kp * sa2) ] = av[ oA + (kk * sa1) + (kk * sa2) ];
				av[ oA + (kp * sa1) + (kp * sa2) + 1 ] = 0.0;

				// Copy and conjugate
				zcopy( kp - kk - 1, A, strideA1, offsetA + (( kk + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kk + 1 ) * strideA2) );
				zlacgv( kp - kk - 1, A, strideA2, offsetA + (kp * strideA1) + (( kk + 1 ) * strideA2) );

				if ( kp < N - 1 ) {
					zcopy( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2) );
				}

				if ( k > 0 ) {
					zswap( k, A, strideA2, offsetA + (kk * strideA1), A, strideA2, offsetA + (kp * strideA1) );
				}
				zswap( kk + 1, W, strideW2, offsetW + (kk * strideW1), W, strideW2, offsetW + (kp * strideW1) );
			}

			if ( kstep === 1 ) {
				zcopy( N - k, W, strideW1, offsetW + (k * strideW1) + (k * strideW2), A, strideA1, offsetA + (k * strideA1) + (k * strideA2) );
				if ( k < N - 1 ) {
					r1 = 1.0 / av[ oA + (k * sa1) + (k * sa2) ];
					zdscal( N - k - 1, r1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );

					// Conjugate W(k+1:N-1, k)
					zlacgv( N - k - 1, W, strideW1, offsetW + (( k + 1 ) * strideW1) + (k * strideW2) );
				}
			} else {
				// 2x2 pivot block
				if ( k < N - 2 ) {
					// D21 = W(k+1, k) — complex
					d21Re = wv[ oW + (( k + 1 ) * sw1) + (k * sw2) ];
					d21Im = wv[ oW + (( k + 1 ) * sw1) + (k * sw2) + 1 ];

					// D11 = W(k+1, k+1) / D21
					tt = wv[ oW + (( k + 1 ) * sw1) + (( k + 1 ) * sw2) ];
					d11Re = ( tt * d21Re ) / ( d21Re * d21Re + d21Im * d21Im );
					d11Im = ( -tt * d21Im ) / ( d21Re * d21Re + d21Im * d21Im );

					// D22 = W(k, k) / conj(D21)
					tt = wv[ oW + (k * sw1) + (k * sw2) ];
					tRe = d21Re;
					tIm = -d21Im;
					d22Re = ( tt * tRe ) / ( tRe * tRe + tIm * tIm );
					d22Im = ( -tt * tIm ) / ( tRe * tRe + tIm * tIm );

					// T = 1 / (real(D11*D22) - 1)
					tRe = (d11Re * d22Re) - (d11Im * d22Im);
					tt = 1.0 / ( tRe - 1.0 );

					// D21 = T / D21
					d21Re = ( tt * d21Re ) / ( d21Re * d21Re + d21Im * d21Im );
					d21Im = ( -tt * wv[ oW + (( k + 1 ) * sw1) + (k * sw2) + 1 ] ) / ( wv[ oW + (( k + 1 ) * sw1) + (k * sw2) ] * wv[ oW + (( k + 1 ) * sw1) + (k * sw2) ] + wv[ oW + (( k + 1 ) * sw1) + (k * sw2) + 1 ] * wv[ oW + (( k + 1 ) * sw1) + (k * sw2) + 1 ] );
					// Re-read original d21 for the division
					tRe = wv[ oW + (( k + 1 ) * sw1) + (k * sw2) ];
					tIm = wv[ oW + (( k + 1 ) * sw1) + (k * sw2) + 1 ];
					d21Re = ( tt * tRe ) / ( tRe * tRe + tIm * tIm );
					d21Im = ( -tt * tIm ) / ( tRe * tRe + tIm * tIm );

					for ( j = k + 2; j < N; j++ ) {
						wjkRe = wv[ oW + (j * sw1) + (k * sw2) ];
						wjkIm = wv[ oW + (j * sw1) + (k * sw2) + 1 ];
						wjkm1Re = wv[ oW + (j * sw1) + (( k + 1 ) * sw2) ];
						wjkm1Im = wv[ oW + (j * sw1) + (( k + 1 ) * sw2) + 1 ];

						// A(j, k) = conj(D21) * (D11*W(j,k) - W(j,k+1))
						aRe = (d11Re * wjkRe) - (d11Im * wjkIm);
						aIm = (d11Re * wjkIm) + (d11Im * wjkRe);
						aRe -= wjkm1Re;
						aIm -= wjkm1Im;
						// conj(D21) = (d21Re, -d21Im)
						av[ oA + (j * sa1) + (k * sa2) ] = (d21Re * aRe) + (d21Im * aIm);
						av[ oA + (j * sa1) + (k * sa2) + 1 ] = (d21Re * aIm) - (d21Im * aRe);

						// A(j, k+1) = D21 * (D22*W(j,k+1) - W(j,k))
						aRe = (d22Re * wjkm1Re) - (d22Im * wjkm1Im);
						aIm = (d22Re * wjkm1Im) + (d22Im * wjkm1Re);
						aRe -= wjkRe;
						aIm -= wjkIm;
						av[ oA + (j * sa1) + (( k + 1 ) * sa2) ] = (d21Re * aRe) - (d21Im * aIm);
						av[ oA + (j * sa1) + (( k + 1 ) * sa2) + 1 ] = (d21Re * aIm) + (d21Im * aRe);
					}
				}

				av[ oA + (k * sa1) + (k * sa2) ] = wv[ oW + (k * sw1) + (k * sw2) ];
				av[ oA + (k * sa1) + (k * sa2) + 1 ] = 0.0;
				av[ oA + (( k + 1 ) * sa1) + (k * sa2) ] = wv[ oW + (( k + 1 ) * sw1) + (k * sw2) ];
				av[ oA + (( k + 1 ) * sa1) + (k * sa2) + 1 ] = wv[ oW + (( k + 1 ) * sw1) + (k * sw2) + 1 ];
				av[ oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) ] = wv[ oW + (( k + 1 ) * sw1) + (( k + 1 ) * sw2) ];
				av[ oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) + 1 ] = 0.0;

				// Conjugate W columns
				zlacgv( N - k - 1, W, strideW1, offsetW + (( k + 1 ) * strideW1) + (k * strideW2) );
				zlacgv( N - k - 2, W, strideW1, offsetW + (( k + 2 ) * strideW1) + (( k + 1 ) * strideW2) );
			}
		}

		// Store IPIV
		if ( kstep === 1 ) {
			IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
		} else {
			IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
			IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ] = ~kp;
		}

		k += kstep;
	}

	// Update lower triangle: apply pending updates
	for ( j = k; j < N; j += nb ) {
		jb = Math.min( nb, N - j );

		for ( jj = j; jj < j + jb; jj++ ) {
			av[ oA + (jj * sa1) + (jj * sa2) + 1 ] = 0.0;
			zgemv( 'no-transpose', j + jb - jj, k, NEGCONE, A, strideA1, strideA2, offsetA + (jj * strideA1), W, strideW2, offsetW + (jj * strideW1), CONE, A, strideA1, offsetA + (jj * strideA1) + (jj * strideA2) );
			av[ oA + (jj * sa1) + (jj * sa2) + 1 ] = 0.0;
		}

		if ( j + jb < N ) {
			zgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, NEGCONE, A, strideA1, strideA2, offsetA + (( j + jb ) * strideA1), W, strideW1, strideW2, offsetW + (j * strideW1), CONE, A, strideA1, strideA2, offsetA + (( j + jb ) * strideA1) + (j * strideA2) );
		}
	}

	// Apply pending row swaps
	j = k - 1;
	while ( j >= 0 ) {
		jj = j;
		jp = IPIV[ offsetIPIV + (j * strideIPIV) ];
		if ( jp < 0 ) {
			jp = ~jp;
			j -= 1;
		}
		j -= 1;
		if ( jp !== jj && j >= 0 ) {
			zswap( j + 1, A, strideA2, offsetA + (jp * strideA1), A, strideA2, offsetA + (jj * strideA1) );
		}
	}

	return {
		'info': info,
		'kb': k
	};
}


// EXPORTS //

export default zlahef;
