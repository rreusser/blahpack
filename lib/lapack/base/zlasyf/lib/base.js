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

/* eslint-disable max-len, max-params, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)| — used for pivot selection.
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
* Computes a partial factorization of a complex symmetric matrix A using the.
* Bunch-Kaufman diagonal pivoting method. This is the blocked panel
* factorization used by zsytrf.
*
* Note: This is SYMMETRIC factorization (not Hermitian). The factorization
* uses transpose (A**T), not conjugate-transpose (A**H).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Complex128Array} A - input/output symmetric matrix (column-major)
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
function zlasyf( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
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
	var r1Re;
	var r1Im;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var kkw;
	var tmp = new Float64Array( 6 );
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
	var k;
	var j;

	av = reinterpret( A, 0 );
	wv = reinterpret( W, 0 );

	// Convert complex-element strides to Float64 strides
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw1 = strideW1 * 2;
	sw2 = strideW2 * 2;
	oA = offsetA * 2;
	oW = offsetW * 2;

	info = 0;

	if ( uplo === 'upper' ) {
		// Factorize the trailing columns of A using the upper triangle
		// K starts at N-1 (0-based) and decreases
		k = N - 1;
		while ( true ) {
			kw = nb + k - N; // 0-based column in W for column k

			// Check termination
			if ( ( k <= N - nb && nb < N ) || k < 0 ) {
				break;
			}

			// Copy column k of A into column kw of W and update
			zcopy( k + 1, A, strideA1, offsetA + (k * strideA2), W, strideW1, offsetW + (kw * strideW2) );
			if ( k < N - 1 ) {
				// W(:, kw) -= A(:, k+1:N-1) * W(k, kw+1:nb-1)^T
				zgemv( 'no-transpose', k + 1, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA2), W, strideW2, offsetW + (k * strideW1) + (( kw + 1 ) * strideW2), CONE, W, strideW1, offsetW + (kw * strideW2) );
			}

			kstep = 1;

			// Determine rows and columns to be interchanged

			// CABS1(W(k, kw)) = |re| + |im|
			absakk = cabs1( wv, oW + (k * sw1) + (kw * sw2) );

			if ( k > 0 ) {
				imax = izamax( k, W, strideW1, offsetW + (kw * strideW2) );
				colmax = cabs1( wv, oW + (imax * sw1) + (kw * sw2) );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero: set INFO
				if ( info === 0 ) {
					info = k + 1; // 1-based
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange
					kp = k;
				} else {
					// Copy column imax of A into column kw-1 of W and update
					zcopy( imax + 1, A, strideA1, offsetA + (imax * strideA2), W, strideW1, offsetW + (( kw - 1 ) * strideW2));
					zcopy( k - imax, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2), W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( kw - 1 ) * strideW2));
					if ( k < N - 1 ) {
						zgemv( 'no-transpose', k + 1, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA2), W, strideW2, offsetW + (imax * strideW1) + (( kw + 1 ) * strideW2), CONE, W, strideW1, offsetW + (( kw - 1 ) * strideW2));
					}

					// JMAX is the column-index of the largest off-diagonal element
					// In row IMAX, and ROWMAX is its absolute value
					jmax = imax + 1 + izamax( k - imax, W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( kw - 1 ) * strideW2));
					rowmax = cabs1( wv, oW + (jmax * sw1) + (( kw - 1 ) * sw2));
					if ( imax > 0 ) {
						jmax = izamax( imax, W, strideW1, offsetW + (( kw - 1 ) * strideW2));
						rowmax = Math.max( rowmax, cabs1( wv, oW + (jmax * sw1) + (( kw - 1 ) * sw2)) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else if ( cabs1( wv, oW + (imax * sw1) + (( kw - 1 ) * sw2)) >= ALPHA * rowmax ) {
						kp = imax;

						// Copy column kw-1 of W into column kw of W
						zcopy( k + 1, W, strideW1, offsetW + (( kw - 1 ) * strideW2), W, strideW1, offsetW + (kw * strideW2) );
					} else {
						kp = imax;
						kstep = 2;
					}
				}

				// Interchange rows and columns
				kk = k - kstep + 1;
				kkw = nb + kk - N;

				if ( kp !== kk ) {
					// Interchange rows kp and kk: A(kp, kp) = A(kk, kk)
					av[ oA + (kp * sa1) + (kp * sa2) ] = av[ oA + (kk * sa1) + (kk * sa2) ];
					av[ oA + (kp * sa1) + (kp * sa2) + 1 ] = av[ oA + (kk * sa1) + (kk * sa2) + 1 ];

					zcopy( kk - 1 - kp, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kp + 1 ) * strideA2));
					if ( kp > 0 ) {
						zcopy( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}

					// Interchange rows kk and kp in trailing columns
					if ( k < N - 1 ) {
						zswap( N - k - 1, A, strideA2, offsetA + (kk * strideA1) + (( k + 1 ) * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( k + 1 ) * strideA2));
					}
					zswap( N - kk, W, strideW2, offsetW + (kk * strideW1) + (kkw * strideW2), W, strideW2, offsetW + (kp * strideW1) + (kkw * strideW2) );
				}

				if ( kstep === 1 ) {
					// 1x1 pivot: copy W(kw) into A(k) and scale
					zcopy( k + 1, W, strideW1, offsetW + (kw * strideW2), A, strideA1, offsetA + (k * strideA2) );

					// R1 = CONE / A(k, k) — complex division

					// tmp[0..1] = (1, 0), tmp[2..3] = A(k, k)
					tmp[ 0 ] = 1.0;
					tmp[ 1 ] = 0.0;
					tmp[ 2 ] = av[ oA + (k * sa1) + (k * sa2) ];
					tmp[ 3 ] = av[ oA + (k * sa1) + (k * sa2) + 1 ];
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 ); // tmp[4..5] = R1
					r1Re = tmp[ 4 ];
					r1Im = tmp[ 5 ];

					// zscal( k, R1, A(:, k) )
					zscal( k, new Complex128( r1Re, r1Im ), A, strideA1, offsetA + (k * strideA2) );
				} else {
					// 2x2 pivot block
					if ( k > 1 ) {
						// d21 = W(k-1, kw) — complex
						d21Re = wv[oW + (( k - 1 ) * sw1) + (kw * sw2)];
						d21Im = wv[oW + (( k - 1 ) * sw1) + (kw * sw2) + 1];

						// d11 = W(k, kw) / d21 — complex division
						tmp[ 0 ] = wv[ oW + (k * sw1) + (kw * sw2) ];
						tmp[ 1 ] = wv[ oW + (k * sw1) + (kw * sw2) + 1 ];
						tmp[ 2 ] = d21Re;
						tmp[ 3 ] = d21Im;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						d11Re = tmp[ 4 ];
						d11Im = tmp[ 5 ];

						// d22 = W(k-1, kw-1) / d21 — complex division
						tmp[ 0 ] = wv[oW + (( k - 1 ) * sw1) + (( kw - 1 ) * sw2)];
						tmp[ 1 ] = wv[oW + (( k - 1 ) * sw1) + (( kw - 1 ) * sw2) + 1];
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						d22Re = tmp[ 4 ];
						d22Im = tmp[ 5 ];

						// T = CONE / (d11*d22 - CONE) — complex

						// d11*d22:
						tRe = (d11Re * d22Re) - (d11Im * d22Im);
						tIm = (d11Re * d22Im) + (d11Im * d22Re);

						// d11*d22 - 1:
						tRe -= 1.0;

						// T = 1 / (d11*d22 - 1):
						tmp[ 0 ] = 1.0;
						tmp[ 1 ] = 0.0;
						tmp[ 2 ] = tRe;
						tmp[ 3 ] = tIm;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						tRe = tmp[ 4 ];
						tIm = tmp[ 5 ];

						// d21 = t / d21 — complex division
						tmp[ 0 ] = tRe;
						tmp[ 1 ] = tIm;
						tmp[ 2 ] = d21Re;
						tmp[ 3 ] = d21Im;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						d21Re = tmp[ 4 ];
						d21Im = tmp[ 5 ];

						for ( j = 0; j <= k - 2; j++ ) {
							// A(j, k-1) = d21 * (d11 * W(j, kw-1) - W(j, kw))
							wjkm1Re = wv[oW + (j * sw1) + (( kw - 1 ) * sw2)];
							wjkm1Im = wv[oW + (j * sw1) + (( kw - 1 ) * sw2) + 1];
							wjkRe = wv[ oW + (j * sw1) + (kw * sw2) ];
							wjkIm = wv[ oW + (j * sw1) + (kw * sw2) + 1 ];

							// d11 * W(j, kw-1):
							aRe = (d11Re * wjkm1Re) - (d11Im * wjkm1Im);
							aIm = (d11Re * wjkm1Im) + (d11Im * wjkm1Re);

							// d11 * W(j, kw-1) - W(j, kw):
							aRe -= wjkRe;
							aIm -= wjkIm;

							// d21 * (...):
							av[oA + (j * sa1) + (( k - 1 ) * sa2)] = (d21Re * aRe) - (d21Im * aIm);
							av[oA + (j * sa1) + (( k - 1 ) * sa2) + 1] = (d21Re * aIm) + (d21Im * aRe);

							// A(j, k) = d21 * (d22 * W(j, kw) - W(j, kw-1))

							// d22 * W(j, kw):
							aRe = (d22Re * wjkRe) - (d22Im * wjkIm);
							aIm = (d22Re * wjkIm) + (d22Im * wjkRe);

							// d22 * W(j, kw) - W(j, kw-1):
							aRe -= wjkm1Re;
							aIm -= wjkm1Im;

							// d21 * (...):
							av[ oA + (j * sa1) + (k * sa2) ] = (d21Re * aRe) - (d21Im * aIm);
							av[ oA + (j * sa1) + (k * sa2) + 1 ] = (d21Re * aIm) + (d21Im * aRe);
						}
					}

					// Copy D(k) back into A
					av[oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2)] = wv[oW + (( k - 1 ) * sw1) + (( kw - 1 ) * sw2)];
					av[oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) + 1] = wv[oW + (( k - 1 ) * sw1) + (( kw - 1 ) * sw2) + 1];
					av[oA + (( k - 1 ) * sa1) + (k * sa2)] = wv[oW + (( k - 1 ) * sw1) + (kw * sw2)];
					av[oA + (( k - 1 ) * sa1) + (k * sa2) + 1] = wv[oW + (( k - 1 ) * sw1) + (kw * sw2) + 1];
					av[ oA + (k * sa1) + (k * sa2) ] = wv[ oW + (k * sw1) + (kw * sw2) ];
					av[ oA + (k * sa1) + (k * sa2) + 1 ] = wv[ oW + (k * sw1) + (kw * sw2) + 1 ];
				}
			}

			// Store IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
				IPIV[offsetIPIV + (( k - 1 ) * strideIPIV)] = ~kp;
			}

			k -= kstep;
		}

		// Update the upper triangle: apply pending updates from W
		for ( j = Math.floor( k / nb ) * nb; j >= 0; j -= nb ) {
			jb = Math.min( nb, k - j + 1 );

			// Update the upper triangle of the diagonal block
			for ( jj = j; jj < j + jb; jj++ ) {
				zgemv( 'no-transpose', jj - j + 1, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (j * strideA1) + (( k + 1 ) * strideA2), W, strideW2, offsetW + (jj * strideW1) + (( kw + 1 ) * strideW2), CONE, A, strideA1, offsetA + (j * strideA1) + (jj * strideA2) );
			}

			// Update the rectangular part above the diagonal block
			zgemm( 'no-transpose', 'transpose', j, jb, N - k - 1, NEGCONE, A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA2), W, strideW1, strideW2, offsetW + (j * strideW1) + (( kw + 1 ) * strideW2), CONE, A, strideA1, strideA2, offsetA + (j * strideA2) );
		}

		// Adjust IPIV and apply pending row swaps
		j = k + 1;
		while ( j < N ) {
			jj = j;
			jp = IPIV[ offsetIPIV + (j * strideIPIV) ];
			if ( jp < 0 ) {
				jp = ~jp; // decode 0-based
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
		// Check termination
		if ( ( k >= nb - 1 && nb < N ) || k >= N ) {
			break;
		}

		// Copy column k of A into column k of W and update
		zcopy( N - k, A, strideA1, offsetA + (k * strideA1) + (k * strideA2), W, strideW1, offsetW + (k * strideW1) + (k * strideW2) );
		zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + (k * strideA1), W, strideW2, offsetW + (k * strideW1), CONE, W, strideW1, offsetW + (k * strideW1) + (k * strideW2) );

		kstep = 1;
		absakk = cabs1( wv, oW + (k * sw1) + (k * sw2) );

		if ( k < N - 1 ) {
			imax = k + 1 + izamax( N - k - 1, W, strideW1, offsetW + (( k + 1 ) * strideW1) + (k * strideW2));
			colmax = cabs1( wv, oW + (imax * sw1) + (k * sw2) );
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
				// Copy row imax into column k+1 of W and update
				zcopy( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2), W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2));
				zcopy( N - imax, A, strideA1, offsetA + (imax * strideA1) + (imax * strideA2), W, strideW1, offsetW + (imax * strideW1) + (( k + 1 ) * strideW2));
				zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + (k * strideA1), W, strideW2, offsetW + (imax * strideW1), CONE, W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2));

				// Scan row imax for largest off-diagonal
				jmax = k + izamax( imax - k, W, strideW1, offsetW + (k * strideW1) + (( k + 1 ) * strideW2));
				rowmax = cabs1( wv, oW + (jmax * sw1) + (( k + 1 ) * sw2));
				if ( imax < N - 1 ) {
					jmax = imax + 1 + izamax( N - imax - 1, W, strideW1, offsetW + (( imax + 1 ) * strideW1) + (( k + 1 ) * strideW2));
					rowmax = Math.max( rowmax, cabs1( wv, oW + (jmax * sw1) + (( k + 1 ) * sw2)) );
				}

				if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
					kp = k;
				} else if ( cabs1( wv, oW + (imax * sw1) + (( k + 1 ) * sw2)) >= ALPHA * rowmax ) {
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
				// Interchange rows kp and kk: A(kp, kp) = A(kk, kk)
				av[ oA + (kp * sa1) + (kp * sa2) ] = av[ oA + (kk * sa1) + (kk * sa2) ];
				av[ oA + (kp * sa1) + (kp * sa2) + 1 ] = av[ oA + (kk * sa1) + (kk * sa2) + 1 ];

				zcopy( kp - kk - 1, A, strideA1, offsetA + (( kk + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kk + 1 ) * strideA2));
				if ( kp < N - 1 ) {
					zcopy( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2));
				}

				// Interchange rows kk and kp in columns 0..k-1
				if ( k > 0 ) {
					zswap( k, A, strideA2, offsetA + (kk * strideA1), A, strideA2, offsetA + (kp * strideA1) );
				}
				zswap( kk + 1, W, strideW2, offsetW + (kk * strideW1), W, strideW2, offsetW + (kp * strideW1) );
			}

			if ( kstep === 1 ) {
				zcopy( N - k, W, strideW1, offsetW + (k * strideW1) + (k * strideW2), A, strideA1, offsetA + (k * strideA1) + (k * strideA2) );
				if ( k < N - 1 ) {
					// R1 = CONE / A(k, k) — complex division
					tmp[ 0 ] = 1.0;
					tmp[ 1 ] = 0.0;
					tmp[ 2 ] = av[ oA + (k * sa1) + (k * sa2) ];
					tmp[ 3 ] = av[ oA + (k * sa1) + (k * sa2) + 1 ];
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					r1Re = tmp[ 4 ];
					r1Im = tmp[ 5 ];

					zscal( N - k - 1, new Complex128( r1Re, r1Im ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2));
				}
			} else {
				// 2x2 pivot block
				if ( k < N - 2 ) {
					// d21 = W(k+1, k) — complex
					d21Re = wv[oW + (( k + 1 ) * sw1) + (k * sw2)];
					d21Im = wv[oW + (( k + 1 ) * sw1) + (k * sw2) + 1];

					// d11 = W(k+1, k+1) / d21
					tmp[ 0 ] = wv[oW + (( k + 1 ) * sw1) + (( k + 1 ) * sw2)];
					tmp[ 1 ] = wv[oW + (( k + 1 ) * sw1) + (( k + 1 ) * sw2) + 1];
					tmp[ 2 ] = d21Re;
					tmp[ 3 ] = d21Im;
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					d11Re = tmp[ 4 ];
					d11Im = tmp[ 5 ];

					// d22 = W(k, k) / d21
					tmp[ 0 ] = wv[ oW + (k * sw1) + (k * sw2) ];
					tmp[ 1 ] = wv[ oW + (k * sw1) + (k * sw2) + 1 ];
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					d22Re = tmp[ 4 ];
					d22Im = tmp[ 5 ];

					// T = CONE / (d11*d22 - CONE)
					tRe = (d11Re * d22Re) - (d11Im * d22Im);
					tIm = (d11Re * d22Im) + (d11Im * d22Re);
					tRe -= 1.0;
					tmp[ 0 ] = 1.0;
					tmp[ 1 ] = 0.0;
					tmp[ 2 ] = tRe;
					tmp[ 3 ] = tIm;
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					tRe = tmp[ 4 ];
					tIm = tmp[ 5 ];

					// d21 = t / d21
					tmp[ 0 ] = tRe;
					tmp[ 1 ] = tIm;
					tmp[ 2 ] = d21Re;
					tmp[ 3 ] = d21Im;
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					d21Re = tmp[ 4 ];
					d21Im = tmp[ 5 ];

					for ( j = k + 2; j < N; j++ ) {
						// A(j, k) = d21 * (d11 * W(j, k) - W(j, k+1))
						wjkRe = wv[ oW + (j * sw1) + (k * sw2) ];
						wjkIm = wv[ oW + (j * sw1) + (k * sw2) + 1 ];
						wjkm1Re = wv[oW + (j * sw1) + (( k + 1 ) * sw2)];
						wjkm1Im = wv[oW + (j * sw1) + (( k + 1 ) * sw2) + 1];

						// d11 * W(j, k):
						aRe = (d11Re * wjkRe) - (d11Im * wjkIm);
						aIm = (d11Re * wjkIm) + (d11Im * wjkRe);

						// d11 * W(j, k) - W(j, k+1):
						aRe -= wjkm1Re;
						aIm -= wjkm1Im;

						// d21 * (...):
						av[ oA + (j * sa1) + (k * sa2) ] = (d21Re * aRe) - (d21Im * aIm);
						av[ oA + (j * sa1) + (k * sa2) + 1 ] = (d21Re * aIm) + (d21Im * aRe);

						// A(j, k+1) = d21 * (d22 * W(j, k+1) - W(j, k))

						// d22 * W(j, k+1):
						aRe = (d22Re * wjkm1Re) - (d22Im * wjkm1Im);
						aIm = (d22Re * wjkm1Im) + (d22Im * wjkm1Re);

						// d22 * W(j, k+1) - W(j, k):
						aRe -= wjkRe;
						aIm -= wjkIm;

						// d21 * (...):
						av[oA + (j * sa1) + (( k + 1 ) * sa2)] = (d21Re * aRe) - (d21Im * aIm);
						av[oA + (j * sa1) + (( k + 1 ) * sa2) + 1] = (d21Re * aIm) + (d21Im * aRe);
					}
				}

				av[ oA + (k * sa1) + (k * sa2) ] = wv[ oW + (k * sw1) + (k * sw2) ];
				av[ oA + (k * sa1) + (k * sa2) + 1 ] = wv[ oW + (k * sw1) + (k * sw2) + 1 ];
				av[oA + (( k + 1 ) * sa1) + (k * sa2)] = wv[oW + (( k + 1 ) * sw1) + (k * sw2)];
				av[oA + (( k + 1 ) * sa1) + (k * sa2) + 1] = wv[oW + (( k + 1 ) * sw1) + (k * sw2) + 1];
				av[oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2)] = wv[oW + (( k + 1 ) * sw1) + (( k + 1 ) * sw2)];
				av[oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) + 1] = wv[oW + (( k + 1 ) * sw1) + (( k + 1 ) * sw2) + 1];
			}
		}

		// Store IPIV
		if ( kstep === 1 ) {
			IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
		} else {
			IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
			IPIV[offsetIPIV + (( k + 1 ) * strideIPIV)] = ~kp;
		}

		k += kstep;
	}

	// Update lower triangle: apply pending updates
	for ( j = k; j < N; j += nb ) {
		jb = Math.min( nb, N - j );

		// Update the lower triangle of the diagonal block
		for ( jj = j; jj < j + jb; jj++ ) {
			zgemv( 'no-transpose', j + jb - jj, k, NEGCONE, A, strideA1, strideA2, offsetA + (jj * strideA1), W, strideW2, offsetW + (jj * strideW1), CONE, A, strideA1, offsetA + (jj * strideA1) + (jj * strideA2) );
		}

		// Update the rectangular part below the diagonal block
		if ( j + jb < N ) {
			zgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, NEGCONE, A, strideA1, strideA2, offsetA + (( j + jb ) * strideA1), W, strideW1, strideW2, offsetW + (j * strideW1), CONE, A, strideA1, strideA2, offsetA + (( j + jb ) * strideA1) + (j * strideA2));
		}
	}

	// Adjust IPIV and apply pending row swaps
	j = k - 1;
	while ( j >= 0 ) {
		jj = j;
		jp = IPIV[ offsetIPIV + (j * strideIPIV) ];
		if ( jp < 0 ) {
			jp = ~jp; // decode 0-based
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

export default zlasyf;
