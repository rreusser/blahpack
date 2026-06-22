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
* Computes `CABS1`: `|re(z)| + |im(z)|`.
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
* Computes a partial factorization of a complex Hermitian matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* ## Notes
*
* -   This is the HERMITIAN factorization (not symmetric). Diagonal entries are real and the conjugate transpose `A**H` is used.
* -   The routine factorizes at most `nb` columns of the trailing (upper) or leading (lower) submatrix of `A` and returns `kb`, the number of columns actually factored, in the result object.
* -   Pivot indices follow the stdlib bitwise-NOT convention: `1x1` pivots use non-negative indices; `2x2` pivots use `~p` (bitwise NOT) for both rows of the block.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Complex128Array} A - input/output Hermitian matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (complex elements)
* @param {Int32Array} IPIV - pivot index output array (length `N`)
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Complex128Array} W - workspace matrix (`N` x `nb`)
* @param {integer} strideW1 - stride of the first dimension of `W` (complex elements)
* @param {integer} strideW2 - stride of the second dimension of `W` (complex elements)
* @param {NonNegativeInteger} offsetW - index offset for `W` (complex elements)
* @returns {Object} result `{ info, kb }` where `info = 0` on success, `info = k+1` (1-based) if the `k`-th pivot is exactly zero
*/
function zlahefRook( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
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
	var jp1;
	var jp2;
	var tRe;
	var aRe;
	var aIm;
	var nrm;
	var si;
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
	var av;
	var wv;
	var p;
	var k;
	var j;

	av = reinterpret( A, 0 );
	wv = reinterpret( W, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw1 = strideW1 * 2;
	sw2 = strideW2 * 2;
	si = strideIPIV;
	oA = offsetA * 2;
	oW = offsetW * 2;

	info = 0;

	if ( uplo === 'upper' ) {
		// K is the main loop index, decreasing from N-1 (0-based) in steps of 1 or 2
		k = N - 1;
		kw = nb + k - N;
		while ( true ) {
			// KW is the column of W which corresponds to column K of A
			kw = nb + k - N;

			// Exit from loop when NB columns factored or K < 0
			if ( ( k <= N - nb && nb < N ) || k < 0 ) {
				break;
			}

			kstep = 1;
			p = k;

			// Copy column K of A to column KW of W and update it
			if ( k > 0 ) {
				zcopy( k, A, strideA1, offsetA + ( k * strideA2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
			}
			// W(k, kw) = real(A(k,k)); imaginary part forced to zero (Hermitian)
			wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
			wv[ oW + ( k * sw1 ) + ( kw * sw2 ) + 1 ] = 0.0;

			if ( k < N - 1 ) {
				zgemv( 'no-transpose', k + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( k * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, W, strideW1, offsetW + ( kw * strideW2 ) );
				wv[ oW + ( k * sw1 ) + ( kw * sw2 ) + 1 ] = 0.0;
			}

			// Determine rows and columns to be interchanged
			absakk = Math.abs( wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ] );

			if ( k > 0 ) {
				imax = izamax( k, W, strideW1, offsetW + ( kw * strideW2 ) );
				colmax = cabs1( wv, oW + ( imax * sw1 ) + ( kw * sw2 ) );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column K is zero or underflow: set INFO and continue
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
				av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
				if ( k > 0 ) {
					zcopy( k, W, strideW1, offsetW + ( kw * strideW2 ), A, strideA1, offsetA + ( k * strideA2 ) );
				}
			} else {
				if ( absakk >= ALPHA_CONST * colmax ) {
					kp = k;
				} else {
					done = false;

					// Pivot search loop (rook pivoting)
					while ( true ) {
						// Copy column IMAX to column KW-1 of W and update it
						if ( imax > 0 ) {
							zcopy( imax, A, strideA1, offsetA + ( imax * strideA2 ), W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
						}
						wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) ] = av[ oA + ( imax * sa1 ) + ( imax * sa2 ) ];
						wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ] = 0.0;

						// Copy conjugate of row IMAX (cols imax+1..k) into W
						zcopy( k - imax, A, strideA2, offsetA + ( imax * strideA1 ) + ( ( imax + 1 ) * strideA2 ), W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( kw - 1 ) * strideW2 ) );
						zlacgv( k - imax, W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( kw - 1 ) * strideW2 ) );

						if ( k < N - 1 ) {
							zgemv( 'no-transpose', k + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( imax * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
							wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ] = 0.0;
						}

						// JMAX is column-index of largest off-diagonal in row IMAX
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

						// Equivalent to testing for ABS(real(W(IMAX,KW-1))) >= ALPHA*ROWMAX (NaN-safe)
						if ( Math.abs( wv[ oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) ] ) >= ALPHA_CONST * rowmax ) {
							// Interchange rows and columns K and IMAX: use 1x1 pivot
							kp = imax;
							zcopy( k + 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							// Interchange rows and columns K-1 and IMAX, use 2x2 pivot block
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							// Pivot not found: set params and repeat
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

				// KK is the column of A where pivoting step stopped
				kk = k - kstep + 1;

				// KKW is the column of W which corresponds to column KK of A
				kkw = nb + kk - N;

				// Interchange rows and columns P and K (only for 2x2 pivot).

				// Updated column P is already stored in column KW of W.
				if ( kstep === 2 && p !== k ) {
					// A(P,P) := real(A(K,K))
					av[ oA + ( p * sa1 ) + ( p * sa2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
					av[ oA + ( p * sa1 ) + ( p * sa2 ) + 1 ] = 0.0;

					// Copy non-updated column K to column P of A (interior strip)
					zcopy( k - 1 - p, A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( p + 1 ) * strideA2 ) );
					zlacgv( k - 1 - p, A, strideA2, offsetA + ( p * strideA1 ) + ( ( p + 1 ) * strideA2 ) );

					if ( p > 0 ) {
						zcopy( p, A, strideA1, offsetA + ( k * strideA2 ), A, strideA1, offsetA + ( p * strideA2 ) );
					}

					// Interchange rows K and P in last K+1..N-1 columns of A
					if ( k < N - 1 ) {
						zswap( N - 1 - k, A, strideA2, offsetA + ( k * strideA1 ) + ( ( k + 1 ) * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( k + 1 ) * strideA2 ) );
					}
					// Interchange rows K and P in last KKW..NB-1 columns of W
					zswap( N - kk, W, strideW2, offsetW + ( k * strideW1 ) + ( kkw * strideW2 ), W, strideW2, offsetW + ( p * strideW1 ) + ( kkw * strideW2 ) );
				}

				// Interchange rows and columns KP and KK.
				// Updated column KP is already stored in column KKW of W.
				if ( kp !== kk ) {
					// A(KP,KP) := real(A(KK,KK))
					av[ oA + ( kp * sa1 ) + ( kp * sa2 ) ] = av[ oA + ( kk * sa1 ) + ( kk * sa2 ) ];
					av[ oA + ( kp * sa1 ) + ( kp * sa2 ) + 1 ] = 0.0;

					// Copy column KK to column KP for the interior strip
					zcopy( kk - 1 - kp, A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kp + 1 ) * strideA2 ) );
					zlacgv( kk - 1 - kp, A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kp + 1 ) * strideA2 ) );

					if ( kp > 0 ) {
						zcopy( kp, A, strideA1, offsetA + ( kk * strideA2 ), A, strideA1, offsetA + ( kp * strideA2 ) );
					}

					// Interchange rows KK and KP in last K+1..N-1 columns of A
					if ( k < N - 1 ) {
						zswap( N - 1 - k, A, strideA2, offsetA + ( kk * strideA1 ) + ( ( k + 1 ) * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( k + 1 ) * strideA2 ) );
					}
					// Interchange rows KK and KP in last KKW..NB-1 columns of W
					zswap( N - kk, W, strideW2, offsetW + ( kk * strideW1 ) + ( kkw * strideW2 ), W, strideW2, offsetW + ( kp * strideW1 ) + ( kkw * strideW2 ) );
				}

				if ( kstep === 1 ) {
					// 1x1 pivot block D(k): column kw of W now holds W(kw) = U(k)*D(k)
					// Store U(k) and D(k,k) in column k of A.
					zcopy( k + 1, W, strideW1, offsetW + ( kw * strideW2 ), A, strideA1, offsetA + ( k * strideA2 ) );
					if ( k > 0 ) {
						// Diagonal element is real
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
						// Conjugate column W(kw) so that subsequent accesses see conj(W)
						zlacgv( k, W, strideW1, offsetW + ( kw * strideW2 ) );
					}
				} else {
					// 2x2 pivot block D(k): columns kw-1 and kw of W now hold
					//   ( W(kw-1) W(kw) ) = ( U(k-1) U(k) )*D(k)
					if ( k > 1 ) {
						// D**(-1) factor — see Fortran derivation comments.
						// D21 = W(k-1, kw); complex
						// D11 = W(k, kw) / conj(D21); W(k,kw) is real
						// D22 = W(k-1, kw-1) / D21; W(k-1,kw-1) is real
						// T = 1/(real(D11*D22) - 1)
						d21Re = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
						d21Im = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) + 1 ];
						nrm = ( d21Re * d21Re ) + ( d21Im * d21Im );

						// D11 = (real * D21) / |D21|^2
						tt = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
						d11Re = ( tt * d21Re ) / nrm;
						d11Im = ( tt * d21Im ) / nrm;

						// D22 = (real * conj(D21)) / |D21|^2
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

							// Divide by D21: (a * conj(D21)) / |D21|^2
							av[ oA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) ] = tt * ( ( ( aRe * d21Re ) + ( aIm * d21Im ) ) / nrm );
							av[ oA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) + 1 ] = tt * ( ( ( aIm * d21Re ) - ( aRe * d21Im ) ) / nrm );

							// A(j, k) = T * (D22*W(j,kw) - W(j,kw-1)) / conj(D21)
							aRe = ( d22Re * wjkRe ) - ( d22Im * wjkIm );
							aIm = ( d22Re * wjkIm ) + ( d22Im * wjkRe );
							aRe -= wjkm1Re;
							aIm -= wjkm1Im;

							// Divide by conj(D21): (a * D21) / |D21|^2
							av[ oA + ( j * sa1 ) + ( k * sa2 ) ] = tt * ( ( ( aRe * d21Re ) - ( aIm * d21Im ) ) / nrm );
							av[ oA + ( j * sa1 ) + ( k * sa2 ) + 1 ] = tt * ( ( ( aRe * d21Im ) + ( aIm * d21Re ) ) / nrm );
						}
					}

					// Copy D(k) to A. Diagonal entries are real.
					av[ oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
					av[ oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) + 1 ] = 0.0;
					av[ oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
					av[ oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) + 1 ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) + 1 ];
					av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
					av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;

					// Conjugate columns W(kw) and W(kw-1) for subsequent reads
					zlacgv( k, W, strideW1, offsetW + ( kw * strideW2 ) );
					if ( k - 1 > 0 ) {
						zlacgv( k - 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
					}
				}
			}

			// Store details of the interchanges in IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( k * si ) ] = kp;
			} else {
				IPIV[ offsetIPIV + ( k * si ) ] = ~p;
				IPIV[ offsetIPIV + ( ( k - 1 ) * si ) ] = ~kp;
			}

			k -= kstep;
		}

		// Update the upper triangle of A11 (= A(0:k, 0:k)) as
		//   A11 := A11 - U12*D*U12**H = A11 - U12*W**H
		// Computing blocks of NB columns at a time (note conj(W) is stored).
		for ( j = ( Math.floor( k / nb ) ) * nb; j >= 0; j -= nb ) {
			jb = Math.min( nb, k - j + 1 );

			// Update the upper triangle of the diagonal block
			for ( jj = j; jj < j + jb; jj++ ) {
				// Force diagonal real before and after the rank-update
				av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
				zgemv( 'no-transpose', jj - j + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( jj * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, A, strideA1, offsetA + ( j * strideA1 ) + ( jj * strideA2 ) );
				av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
			}

			// Update the rectangular superdiagonal block
			if ( j >= 1 ) {
				zgemm( 'no-transpose', 'transpose', j, jb, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW1, strideW2, offsetW + ( j * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, A, strideA1, strideA2, offsetA + ( j * strideA2 ) );
			}
		}

		// Put U12 in standard form by partially undoing the interchanges in
		// Columns k+1..N-1, looping forward from J = k+1.
		j = k + 1;
		while ( j < N ) {
			kstep = 1;
			jp1 = 0;
			jj = j;
			jp2 = IPIV[ offsetIPIV + ( j * si ) ];
			if ( jp2 < 0 ) {
				jp2 = ~jp2;
				j += 1;
				jp1 = ~IPIV[ offsetIPIV + ( j * si ) ];
				kstep = 2;
			}
			j += 1;
			if ( jp2 !== jj && j <= N - 1 ) {
				zswap( N - j, A, strideA2, offsetA + ( jp2 * strideA1 ) + ( j * strideA2 ), A, strideA2, offsetA + ( jj * strideA1 ) + ( j * strideA2 ) );
			}
			jj = j - 1;
			if ( kstep === 2 && jp1 !== jj && j <= N - 1 ) {
				zswap( N - j, A, strideA2, offsetA + ( jp1 * strideA1 ) + ( j * strideA2 ), A, strideA2, offsetA + ( jj * strideA1 ) + ( j * strideA2 ) );
			}
		}

		// Set KB to the number of columns factorized
		return {
			'info': info,
			'kb': N - 1 - k
		};
	}

	// Lower case: factorize the leading columns of A
	// K is the main loop index, increasing from 0 (0-based) in steps of 1 or 2
	k = 0;
	while ( true ) {
		// Exit from loop when NB columns factored or K >= N
		if ( ( k >= nb - 1 && nb < N ) || k >= N ) {
			break;
		}

		kstep = 1;
		p = k;

		// Copy column K of A to column K of W and update it

		// W(k, k) = real(A(k,k))
		wv[ oW + ( k * sw1 ) + ( k * sw2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
		wv[ oW + ( k * sw1 ) + ( k * sw2 ) + 1 ] = 0.0;
		if ( k < N - 1 ) {
			zcopy( N - 1 - k, A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ), W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
		}
		if ( k > 0 ) {
			zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ), W, strideW2, offsetW + ( k * strideW1 ), CONE, W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
			wv[ oW + ( k * sw1 ) + ( k * sw2 ) + 1 ] = 0.0;
		}

		// Determine rows and columns to be interchanged
		absakk = Math.abs( wv[ oW + ( k * sw1 ) + ( k * sw2 ) ] );

		if ( k < N - 1 ) {
			imax = k + 1 + izamax( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
			colmax = cabs1( wv, oW + ( imax * sw1 ) + ( k * sw2 ) );
		} else {
			colmax = 0.0;
		}

		if ( Math.max( absakk, colmax ) === 0.0 ) {
			// Column K is zero or underflow: set INFO and continue
			if ( info === 0 ) {
				info = k + 1;
			}
			kp = k;
			av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
			av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
			if ( k < N - 1 ) {
				zcopy( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ), A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ) );
			}
		} else {
			if ( absakk >= ALPHA_CONST * colmax ) {
				kp = k;
			} else {
				done = false;

				while ( true ) {
					// Copy conjugate of row IMAX (cols k..imax-1) into W column k+1
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

			// KK is the column of A where pivoting step stopped
			kk = k + kstep - 1;

			// Interchange rows and columns P and K (only for 2x2 pivot).

			// Updated column P is already stored in column K of W.
			if ( kstep === 2 && p !== k ) {
				// A(P,P) := real(A(K,K))
				av[ oA + ( p * sa1 ) + ( p * sa2 ) ] = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
				av[ oA + ( p * sa1 ) + ( p * sa2 ) + 1 ] = 0.0;

				// Copy column K (rows k+1..p-1) to row P (cols k+1..p-1) with conjugation
				zcopy( p - k - 1, A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( k + 1 ) * strideA2 ) );
				zlacgv( p - k - 1, A, strideA2, offsetA + ( p * strideA1 ) + ( ( k + 1 ) * strideA2 ) );

				if ( p < N - 1 ) {
					zcopy( N - 1 - p, A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( p * strideA2 ) );
				}

				// Interchange rows K and P in first K-1 columns of A
				if ( k > 0 ) {
					zswap( k, A, strideA2, offsetA + ( k * strideA1 ), A, strideA2, offsetA + ( p * strideA1 ) );
				}
				// Interchange rows K and P in first KK columns of W
				zswap( kk + 1, W, strideW2, offsetW + ( k * strideW1 ), W, strideW2, offsetW + ( p * strideW1 ) );
			}

			// Interchange rows and columns KP and KK.
			// Updated column KP is already stored in column KK of W.
			if ( kp !== kk ) {
				// A(KP,KP) := real(A(KK,KK))
				av[ oA + ( kp * sa1 ) + ( kp * sa2 ) ] = av[ oA + ( kk * sa1 ) + ( kk * sa2 ) ];
				av[ oA + ( kp * sa1 ) + ( kp * sa2 ) + 1 ] = 0.0;

				zcopy( kp - kk - 1, A, strideA1, offsetA + ( ( kk + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kk + 1 ) * strideA2 ) );
				zlacgv( kp - kk - 1, A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kk + 1 ) * strideA2 ) );

				if ( kp < N - 1 ) {
					zcopy( N - 1 - kp, A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kp * strideA2 ) );
				}

				// Interchange rows KK and KP in first K-1 columns of A
				if ( k > 0 ) {
					zswap( k, A, strideA2, offsetA + ( kk * strideA1 ), A, strideA2, offsetA + ( kp * strideA1 ) );
				}
				zswap( kk + 1, W, strideW2, offsetW + ( kk * strideW1 ), W, strideW2, offsetW + ( kp * strideW1 ) );
			}

			if ( kstep === 1 ) {
				// 1x1 pivot block D(k): column k of W now holds W(k) = L(k)*D(k)
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
					// Conjugate column W(k)
					zlacgv( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
				}
			} else {
				// 2x2 pivot block D(k)
				if ( k < N - 2 ) {
					// D21 = W(k+1, k); complex
					// D11 = W(k+1, k+1) / D21; W(k+1,k+1) is real
					// D22 = W(k, k) / conj(D21); W(k,k) is real
					d21Re = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
					d21Im = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) + 1 ];
					nrm = ( d21Re * d21Re ) + ( d21Im * d21Im );

					// D11 = (real * conj(D21)) / |D21|^2
					tt = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
					d11Re = ( tt * d21Re ) / nrm;
					d11Im = ( -tt * d21Im ) / nrm;

					// D22 = (real * D21) / |D21|^2
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

				// Copy D(k) to A. Diagonal entries are real.
				av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
				av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = 0.0;
				av[ oA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) + 1 ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) + 1 ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) + 1 ] = 0.0;

				// Conjugate columns W(k) and W(k+1)
				zlacgv( N - 1 - k, W, strideW1, offsetW + ( ( k + 1 ) * strideW1 ) + ( k * strideW2 ) );
				if ( N - 2 - k > 0 ) {
					zlacgv( N - 2 - k, W, strideW1, offsetW + ( ( k + 2 ) * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
				}
			}
		}

		// Store details of the interchanges in IPIV
		if ( kstep === 1 ) {
			IPIV[ offsetIPIV + ( k * si ) ] = kp;
		} else {
			IPIV[ offsetIPIV + ( k * si ) ] = ~p;
			IPIV[ offsetIPIV + ( ( k + 1 ) * si ) ] = ~kp;
		}

		k += kstep;
	}

	// Update the lower triangle of A22 (= A(k:N-1, k:N-1)) as
	//   A22 := A22 - L21*D*L21**H = A22 - L21*W**H
	for ( j = k; j < N; j += nb ) {
		jb = Math.min( nb, N - j );

		// Update the lower triangle of the diagonal block
		for ( jj = j; jj < j + jb; jj++ ) {
			av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
			zgemv( 'no-transpose', j + jb - jj, k, NEGCONE, A, strideA1, strideA2, offsetA + ( jj * strideA1 ), W, strideW2, offsetW + ( jj * strideW1 ), CONE, A, strideA1, offsetA + ( jj * strideA1 ) + ( jj * strideA2 ) );
			av[ oA + ( jj * sa1 ) + ( jj * sa2 ) + 1 ] = 0.0;
		}

		// Update the rectangular subdiagonal block
		if ( j + jb < N ) {
			zgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ), W, strideW1, strideW2, offsetW + ( j * strideW1 ), CONE, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ) + ( j * strideA2 ) );
		}
	}

	// Put L21 in standard form by partially undoing the interchanges in
	// Columns 0..k-1, looping backward from J = k-1.
	j = k - 1;
	while ( j > 0 ) {
		kstep = 1;
		jp1 = 0;
		jj = j;
		jp2 = IPIV[ offsetIPIV + ( j * si ) ];
		if ( jp2 < 0 ) {
			jp2 = ~jp2;
			j -= 1;
			jp1 = ~IPIV[ offsetIPIV + ( j * si ) ];
			kstep = 2;
		}
		j -= 1;
		if ( jp2 !== jj && j >= 0 ) {
			zswap( j + 1, A, strideA2, offsetA + ( jp2 * strideA1 ), A, strideA2, offsetA + ( jj * strideA1 ) );
		}
		jj = j + 1;
		if ( kstep === 2 && jp1 !== jj && j >= 0 ) {
			zswap( j + 1, A, strideA2, offsetA + ( jp1 * strideA1 ), A, strideA2, offsetA + ( jj * strideA1 ) );
		}
	}

	return {
		'info': info,
		'kb': k
	};
}


// EXPORTS //

export default zlahefRook;
