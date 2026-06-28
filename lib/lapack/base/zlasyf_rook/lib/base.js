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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ALPHA_CONST = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* Computes `CABS1(z) = |re(z)| + |im(z)|`.
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
* Computes a partial factorization of a complex symmetric matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* ## Notes
*
* -   The routine factorizes at most `nb` columns of the trailing (upper) or leading (lower) submatrix of `A` and returns the number of columns actually factored in `kb`.
* -   Pivot indices follow the stdlib bitwise-NOT convention: 1x1 pivots use non-negative indices; 2x2 pivots use `~p` (bitwise NOT) for both rows of the block.
* -   Operates on a complex symmetric (NOT Hermitian) matrix. There is no conjugation at mirror reads and the diagonal may be fully complex.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Complex128Array} A - input/output complex symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (complex elements)
* @param {Int32Array} IPIV - pivot index output array (length `N`)
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Complex128Array} W - workspace matrix (`N x nb`)
* @param {integer} strideW1 - stride of the first dimension of `W` (complex elements)
* @param {integer} strideW2 - stride of the second dimension of `W` (complex elements)
* @param {NonNegativeInteger} offsetW - index offset for `W` (complex elements)
* @returns {Object} result `{ info, kb }` where `info = 0` on success, `info = k+1` (1-based) if the `k`-th pivot is exactly zero
*/
function zlasyfRook( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
	var wjkm1Re;
	var wjkm1Im;
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var dtemp;
	var itemp;
	var wjkRe;
	var wjkIm;
	var d11Re;
	var d11Im;
	var d12Re;
	var d12Im;
	var d22Re;
	var d22Im;
	var done;
	var info;
	var imax;
	var jmax;
	var r1Re;
	var r1Im;
	var akkR;
	var akkI;
	var jp1;
	var jp2;
	var kkw;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var tmp;
	var aRe;
	var aIm;
	var tRe;
	var tIm;
	var av;
	var ii;
	var jb;
	var jj;
	var kk;
	var kp;
	var kw;
	var oA;
	var oW;
	var si;
	var wv;
	var j;
	var k;
	var p;

	av = reinterpret( A, 0 );
	wv = reinterpret( W, 0 );
	tmp = new Float64Array( 6 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw1 = strideW1 * 2;
	sw2 = strideW2 * 2;
	si = strideIPIV;
	oA = offsetA * 2;
	oW = offsetW * 2;

	info = 0;

	if ( uplo === 'upper' ) {
		// K is the main loop index, decreasing from N-1 (0-based)
		k = N - 1;
		while ( true ) {
			// KW is the column of W corresponding to column K of A
			kw = nb + k - N;

			// Exit when NB columns factored or K < 0
			if ( ( k <= N - nb && nb < N ) || k < 0 ) {
				break;
			}

			kstep = 1;
			p = k;

			// Copy column K of A to column KW of W and update it
			zcopy( k + 1, A, strideA1, offsetA + ( k * strideA2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
			if ( k < N - 1 ) {
				zgemv( 'no-transpose', k + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( k * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, W, strideW1, offsetW + ( kw * strideW2 ) );
			}

			// Determine rows and columns to be interchanged
			absakk = cabs1( wv, oW + ( k * sw1 ) + ( kw * sw2 ) );

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
				zcopy( k + 1, W, strideW1, offsetW + ( kw * strideW2 ), A, strideA1, offsetA + ( k * strideA2 ) );
			} else {
				// Test for interchange
				if ( absakk >= ALPHA_CONST * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					done = false;

					// Pivot search loop (rook pivoting)
					while ( true ) {
						// Copy column IMAX to column KW-1 of W and update it
						zcopy( imax + 1, A, strideA1, offsetA + ( imax * strideA2 ), W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
						zcopy( k - imax, A, strideA2, offsetA + ( imax * strideA1 ) + ( ( imax + 1 ) * strideA2 ), W, strideW1, offsetW + ( ( imax + 1 ) * strideW1 ) + ( ( kw - 1 ) * strideW2 ) );

						if ( k < N - 1 ) {
							zgemv( 'no-transpose', k + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( imax * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ) );
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

						// Equivalent to testing for CABS1( W(IMAX,KW-1) ) >= ALPHA*ROWMAX
						if ( cabs1( wv, oW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) ) >= ALPHA_CONST * rowmax ) {
							// Interchange rows and columns K and IMAX: use 1x1 pivot
							kp = imax;
							zcopy( k + 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							// Interchange rows and columns K-1 and IMAX; use 2x2 pivot block
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							// Pivot not found: set params and repeat
							p = imax;
							colmax = rowmax;
							imax = jmax;

							// Copy updated JMAXth (next IMAXth) column to KW-1
							zcopy( k + 1, W, strideW1, offsetW + ( ( kw - 1 ) * strideW2 ), W, strideW1, offsetW + ( kw * strideW2 ) );
						}

						if ( done ) {
							break;
						}
					}
				}

				// KK is the column of A where pivoting step stopped
				kk = k - kstep + 1;

				// KKW is the column of W corresponding to column KK of A
				kkw = nb + kk - N;

				// Interchange rows and columns P and K.

				// Updated column P is already stored in column KW of W.
				if ( kstep === 2 && p !== k ) {
					// Fortran: ZCOPY( K-P, A( P+1, K ), 1, A( P, P+1 ), LDA )
					zcopy( k - p, A, strideA1, offsetA + ( ( p + 1 ) * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( ( p + 1 ) * strideA2 ) );

					// Fortran: ZCOPY( P, A( 1, K ), 1, A( 1, P ), 1 )
					zcopy( p, A, strideA1, offsetA + ( k * strideA2 ), A, strideA1, offsetA + ( p * strideA2 ) );

					// Interchange rows K and P in last K..N-1 columns of A.
					zswap( N - k, A, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( k * strideA2 ) );

					// Interchange rows K and P in last KKW to NB columns of W.
					zswap( N - kk, W, strideW2, offsetW + ( k * strideW1 ) + ( kkw * strideW2 ), W, strideW2, offsetW + ( p * strideW1 ) + ( kkw * strideW2 ) );
				}

				// Interchange rows and columns KP and KK.
				// Updated column KP is already stored in column KKW of W.
				if ( kp !== kk ) {
					// Copy non-updated column KK to column KP of submatrix A at step K.
					av[ oA + ( kp * sa1 ) + ( kp * sa2 ) ] = av[ oA + ( kk * sa1 ) + ( kk * sa2 ) ];
					av[ oA + ( kp * sa1 ) + ( kp * sa2 ) + 1 ] = av[ oA + ( kk * sa1 ) + ( kk * sa2 ) + 1 ];

					zcopy( kk - 1 - kp, A, strideA1, offsetA + ( ( kp + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( kp + 1 ) * strideA2 ) );
					zcopy( kp, A, strideA1, offsetA + ( kk * strideA2 ), A, strideA1, offsetA + ( kp * strideA2 ) );

					// Interchange rows KK and KP in last K+1 to N columns of A.
					zswap( N - kk, A, strideA2, offsetA + ( kk * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( kk * strideA2 ) );

					// Interchange rows KK and KP in last KKW to NB columns of W.
					zswap( N - kk, W, strideW2, offsetW + ( kk * strideW1 ) + ( kkw * strideW2 ), W, strideW2, offsetW + ( kp * strideW1 ) + ( kkw * strideW2 ) );
				}

				if ( kstep === 1 ) {
					// 1x1 pivot block D(k): column k of W now holds W(k) = U(k)*D(k)
					// Store U(k) in column k of A.
					zcopy( k + 1, W, strideW1, offsetW + ( kw * strideW2 ), A, strideA1, offsetA + ( k * strideA2 ) );
					if ( k > 0 ) {
						akkR = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
						akkI = av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ];
						if ( ( Math.abs( akkR ) + Math.abs( akkI ) ) >= SFMIN ) {
							// R1 = 1 / A(k,k)
							tmp[ 0 ] = 1.0;
							tmp[ 1 ] = 0.0;
							tmp[ 2 ] = akkR;
							tmp[ 3 ] = akkI;
							cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
							r1Re = tmp[ 4 ];
							r1Im = tmp[ 5 ];
							zscal( k, new Complex128( r1Re, r1Im ), A, strideA1, offsetA + ( k * strideA2 ) );
						} else if ( akkR !== 0.0 || akkI !== 0.0 ) {
							for ( ii = 0; ii < k; ii++ ) {
								tmp[ 0 ] = av[ oA + ( ii * sa1 ) + ( k * sa2 ) ];
								tmp[ 1 ] = av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ];
								tmp[ 2 ] = akkR;
								tmp[ 3 ] = akkI;
								cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
								av[ oA + ( ii * sa1 ) + ( k * sa2 ) ] = tmp[ 4 ];
								av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ] = tmp[ 5 ];
							}
						}
					}
				} else {
					// 2x2 pivot block D(k): columns k-1 and k of W now hold
					//   ( W(k-1) W(k) ) = ( U(k-1) U(k) )*D(k)
					if ( k > 1 ) {
						// D12 = W(k-1, kw)
						d12Re = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
						d12Im = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) + 1 ];

						// D11 = W(k, kw) / D12
						tmp[ 0 ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
						tmp[ 1 ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) + 1 ];
						tmp[ 2 ] = d12Re;
						tmp[ 3 ] = d12Im;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						d11Re = tmp[ 4 ];
						d11Im = tmp[ 5 ];

						// D22 = W(k-1, kw-1) / D12
						tmp[ 0 ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
						tmp[ 1 ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ];
						tmp[ 2 ] = d12Re;
						tmp[ 3 ] = d12Im;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						d22Re = tmp[ 4 ];
						d22Im = tmp[ 5 ];

						// T = 1 / (D11*D22 - 1)
						tRe = ( d11Re * d22Re ) - ( d11Im * d22Im );
						tIm = ( d11Re * d22Im ) + ( d11Im * d22Re );
						tRe -= 1.0;
						tmp[ 0 ] = 1.0;
						tmp[ 1 ] = 0.0;
						tmp[ 2 ] = tRe;
						tmp[ 3 ] = tIm;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						tRe = tmp[ 4 ];
						tIm = tmp[ 5 ];

						for ( j = 0; j <= k - 2; j++ ) {
							wjkm1Re = wv[ oW + ( j * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
							wjkm1Im = wv[ oW + ( j * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ];
							wjkRe = wv[ oW + ( j * sw1 ) + ( kw * sw2 ) ];
							wjkIm = wv[ oW + ( j * sw1 ) + ( kw * sw2 ) + 1 ];

							// A(j, k-1) = T * (D11*W(j,kw-1) - W(j,kw)) / D12
							aRe = ( d11Re * wjkm1Re ) - ( d11Im * wjkm1Im );
							aIm = ( d11Re * wjkm1Im ) + ( d11Im * wjkm1Re );
							aRe -= wjkRe;
							aIm -= wjkIm;
							tmp[ 0 ] = aRe;
							tmp[ 1 ] = aIm;
							tmp[ 2 ] = d12Re;
							tmp[ 3 ] = d12Im;
							cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
							av[ oA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) ] = ( tRe * tmp[ 4 ] ) - ( tIm * tmp[ 5 ] );
							av[ oA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) + 1 ] = ( tRe * tmp[ 5 ] ) + ( tIm * tmp[ 4 ] );

							// A(j, k) = T * (D22*W(j,kw) - W(j,kw-1)) / D12
							aRe = ( d22Re * wjkRe ) - ( d22Im * wjkIm );
							aIm = ( d22Re * wjkIm ) + ( d22Im * wjkRe );
							aRe -= wjkm1Re;
							aIm -= wjkm1Im;
							tmp[ 0 ] = aRe;
							tmp[ 1 ] = aIm;
							tmp[ 2 ] = d12Re;
							tmp[ 3 ] = d12Im;
							cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
							av[ oA + ( j * sa1 ) + ( k * sa2 ) ] = ( tRe * tmp[ 4 ] ) - ( tIm * tmp[ 5 ] );
							av[ oA + ( j * sa1 ) + ( k * sa2 ) + 1 ] = ( tRe * tmp[ 5 ] ) + ( tIm * tmp[ 4 ] );
						}
					}

					// Copy D(k) to A. zlasyf_rook keeps the super-diagonal entry (no zero-out, unlike _rk).
					av[ oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
					av[ oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) + 1 ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) + 1 ];
					av[ oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
					av[ oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) + 1 ] = wv[ oW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) + 1 ];
					av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) ];
					av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = wv[ oW + ( k * sw1 ) + ( kw * sw2 ) + 1 ];
				}
			}

			// Store details of the interchanges in IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( k * si ) ] = kp;
			} else {
				IPIV[ offsetIPIV + ( k * si ) ] = ~p;
				IPIV[ offsetIPIV + ( ( k - 1 ) * si ) ] = ~kp;
			}

			// Decrease K and return to the start of the main loop
			k -= kstep;
		}

		// Update the upper triangle of A11 (= A(0:k, 0:k)) as
		//   A11 := A11 - U12*D*U12^T = A11 - U12*W^T
		// Computing blocks of NB columns at a time.
		for ( j = ( Math.floor( k / nb ) ) * nb; j >= 0; j -= nb ) {
			jb = Math.min( nb, k - j + 1 );

			// Update the upper triangle of the diagonal block
			for ( jj = j; jj < j + jb; jj++ ) {
				zgemv( 'no-transpose', jj - j + 1, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( ( k + 1 ) * strideA2 ), W, strideW2, offsetW + ( jj * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, A, strideA1, offsetA + ( j * strideA1 ) + ( jj * strideA2 ) );
			}

			// Update the rectangular superdiagonal block
			if ( j >= 1 ) {
				zgemm( 'no-transpose', 'transpose', j, jb, N - 1 - k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( k + 1 ) * strideA2 ), W, strideW1, strideW2, offsetW + ( j * strideW1 ) + ( ( kw + 1 ) * strideW2 ), CONE, A, strideA1, strideA2, offsetA + ( j * strideA2 ) );
			}
		}

		// Put U12 in standard form by partially undoing the interchanges in
		// Columns k+1..N-1 looping forward from J = k+1.
		// Fortran reference (1-based) preserves the bitwise-NOT 2x2-pivot encoding.
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
			if ( jp1 !== jj && kstep === 2 ) {
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
		// Exit when NB columns factored or K >= N
		if ( ( k >= nb - 1 && nb < N ) || k >= N ) {
			break;
		}

		kstep = 1;
		p = k;

		// Copy column K of A to column K of W and update it
		zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( k * strideA2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
		if ( k > 0 ) {
			zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ), W, strideW2, offsetW + ( k * strideW1 ), CONE, W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
		}

		// Determine rows and columns to be interchanged
		absakk = cabs1( wv, oW + ( k * sw1 ) + ( k * sw2 ) );

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
			zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( k * strideA2 ) );
		} else {
			// Test for interchange
			if ( absakk >= ALPHA_CONST * colmax ) {
				kp = k;
			} else {
				done = false;

				while ( true ) {
					// Copy column IMAX to column K+1 of W and update it
					zcopy( imax - k, A, strideA2, offsetA + ( imax * strideA1 ) + ( k * strideA2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
					zcopy( N - imax, A, strideA1, offsetA + ( imax * strideA1 ) + ( imax * strideA2 ), W, strideW1, offsetW + ( imax * strideW1 ) + ( ( k + 1 ) * strideW2 ) );

					if ( k > 0 ) {
						zgemv( 'no-transpose', N - k, k, NEGCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ), W, strideW2, offsetW + ( imax * strideW1 ), CONE, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ) );
					}

					// JMAX is column-index of largest off-diagonal in row IMAX
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

					// Equivalent to testing for CABS1( W(IMAX,K+1) ) >= ALPHA*ROWMAX
					if ( cabs1( wv, oW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) ) >= ALPHA_CONST * rowmax ) {
						// Interchange rows and columns K and IMAX: use 1x1 pivot
						kp = imax;

						// Copy column K+1 of W to column K of W
						zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
						done = true;
					} else if ( p === jmax || rowmax <= colmax ) {
						// Interchange rows and columns K+1 and IMAX, use 2x2 pivot block
						kp = imax;
						kstep = 2;
						done = true;
					} else {
						p = imax;
						colmax = rowmax;
						imax = jmax;

						// Copy updated JMAXth (next IMAXth) column to K+1
						zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( ( k + 1 ) * strideW2 ), W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ) );
					}

					if ( done ) {
						break;
					}
				}
			}

			// KK is the column of A where pivoting step stopped
			kk = k + kstep - 1;

			// Interchange rows and columns P and K.

			// Updated column P is already stored in column K of W.
			if ( kstep === 2 && p !== k ) {
				// Fortran: ZCOPY( P-K, A( K, K ), 1, A( P, K ), LDA )
				zcopy( p - k, A, strideA1, offsetA + ( k * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( p * strideA1 ) + ( k * strideA2 ) );

				// Fortran: ZCOPY( N-P+1, A( P, K ), 1, A( P, P ), 1 )
				zcopy( N - p, A, strideA1, offsetA + ( p * strideA1 ) + ( k * strideA2 ), A, strideA1, offsetA + ( p * strideA1 ) + ( p * strideA2 ) );

				// Interchange rows K and P in first K columns of A and first KK columns of W.
				zswap( k + 1, A, strideA2, offsetA + ( k * strideA1 ), A, strideA2, offsetA + ( p * strideA1 ) );
				zswap( kk + 1, W, strideW2, offsetW + ( k * strideW1 ), W, strideW2, offsetW + ( p * strideW1 ) );
			}

			// Interchange rows and columns KP and KK.
			// Updated column KP is already stored in column KK of W.
			if ( kp !== kk ) {
				// Fortran: A( KP, K ) = A( KK, K )
				av[ oA + ( kp * sa1 ) + ( k * sa2 ) ] = av[ oA + ( kk * sa1 ) + ( k * sa2 ) ];
				av[ oA + ( kp * sa1 ) + ( k * sa2 ) + 1 ] = av[ oA + ( kk * sa1 ) + ( k * sa2 ) + 1 ];

				// Fortran: ZCOPY( KP-K-1, A( K+1, KK ), 1, A( KP, K+1 ), LDA )
				zcopy( kp - k - 1, A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( kk * strideA2 ), A, strideA2, offsetA + ( kp * strideA1 ) + ( ( k + 1 ) * strideA2 ) );

				// Fortran: ZCOPY( N-KP+1, A( KP, KK ), 1, A( KP, KP ), 1 )
				zcopy( N - kp, A, strideA1, offsetA + ( kp * strideA1 ) + ( kk * strideA2 ), A, strideA1, offsetA + ( kp * strideA1 ) + ( kp * strideA2 ) );

				// Interchange rows KK and KP in first KK columns of A and W.
				zswap( kk + 1, A, strideA2, offsetA + ( kk * strideA1 ), A, strideA2, offsetA + ( kp * strideA1 ) );
				zswap( kk + 1, W, strideW2, offsetW + ( kk * strideW1 ), W, strideW2, offsetW + ( kp * strideW1 ) );
			}

			if ( kstep === 1 ) {
				// 1x1 pivot block D(k): column k of W now holds W(k) = L(k)*D(k).
				// Store L(k) in column k of A.
				zcopy( N - k, W, strideW1, offsetW + ( k * strideW1 ) + ( k * strideW2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( k * strideA2 ) );
				if ( k < N - 1 ) {
					akkR = av[ oA + ( k * sa1 ) + ( k * sa2 ) ];
					akkI = av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ];
					if ( ( Math.abs( akkR ) + Math.abs( akkI ) ) >= SFMIN ) {
						// R1 = 1 / A(k,k)
						tmp[ 0 ] = 1.0;
						tmp[ 1 ] = 0.0;
						tmp[ 2 ] = akkR;
						tmp[ 3 ] = akkI;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						r1Re = tmp[ 4 ];
						r1Im = tmp[ 5 ];
						zscal( N - 1 - k, new Complex128( r1Re, r1Im ), A, strideA1, offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ) );
					} else if ( akkR !== 0.0 || akkI !== 0.0 ) {
						for ( ii = k + 1; ii < N; ii++ ) {
							tmp[ 0 ] = av[ oA + ( ii * sa1 ) + ( k * sa2 ) ];
							tmp[ 1 ] = av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ];
							tmp[ 2 ] = akkR;
							tmp[ 3 ] = akkI;
							cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
							av[ oA + ( ii * sa1 ) + ( k * sa2 ) ] = tmp[ 4 ];
							av[ oA + ( ii * sa1 ) + ( k * sa2 ) + 1 ] = tmp[ 5 ];
						}
					}
				}
			} else {
				// 2x2 pivot block D(k)
				if ( k < N - 2 ) {
					// D21 = W(k+1, k)
					d12Re = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
					d12Im = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) + 1 ];

					// D11 = W(k+1, k+1) / D21
					tmp[ 0 ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
					tmp[ 1 ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) + 1 ];
					tmp[ 2 ] = d12Re;
					tmp[ 3 ] = d12Im;
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					d11Re = tmp[ 4 ];
					d11Im = tmp[ 5 ];

					// D22 = W(k, k) / D21
					tmp[ 0 ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
					tmp[ 1 ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) + 1 ];
					tmp[ 2 ] = d12Re;
					tmp[ 3 ] = d12Im;
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					d22Re = tmp[ 4 ];
					d22Im = tmp[ 5 ];

					// T = 1 / (D11*D22 - 1)
					tRe = ( d11Re * d22Re ) - ( d11Im * d22Im );
					tIm = ( d11Re * d22Im ) + ( d11Im * d22Re );
					tRe -= 1.0;
					tmp[ 0 ] = 1.0;
					tmp[ 1 ] = 0.0;
					tmp[ 2 ] = tRe;
					tmp[ 3 ] = tIm;
					cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
					tRe = tmp[ 4 ];
					tIm = tmp[ 5 ];

					for ( j = k + 2; j < N; j++ ) {
						wjkRe = wv[ oW + ( j * sw1 ) + ( k * sw2 ) ];
						wjkIm = wv[ oW + ( j * sw1 ) + ( k * sw2 ) + 1 ];
						wjkm1Re = wv[ oW + ( j * sw1 ) + ( ( k + 1 ) * sw2 ) ];
						wjkm1Im = wv[ oW + ( j * sw1 ) + ( ( k + 1 ) * sw2 ) + 1 ];

						// A(j, k) = T * (D11*W(j,k) - W(j,k+1)) / D21
						aRe = ( d11Re * wjkRe ) - ( d11Im * wjkIm );
						aIm = ( d11Re * wjkIm ) + ( d11Im * wjkRe );
						aRe -= wjkm1Re;
						aIm -= wjkm1Im;
						tmp[ 0 ] = aRe;
						tmp[ 1 ] = aIm;
						tmp[ 2 ] = d12Re;
						tmp[ 3 ] = d12Im;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						av[ oA + ( j * sa1 ) + ( k * sa2 ) ] = ( tRe * tmp[ 4 ] ) - ( tIm * tmp[ 5 ] );
						av[ oA + ( j * sa1 ) + ( k * sa2 ) + 1 ] = ( tRe * tmp[ 5 ] ) + ( tIm * tmp[ 4 ] );

						// A(j, k+1) = T * (D22*W(j,k+1) - W(j,k)) / D21
						aRe = ( d22Re * wjkm1Re ) - ( d22Im * wjkm1Im );
						aIm = ( d22Re * wjkm1Im ) + ( d22Im * wjkm1Re );
						aRe -= wjkRe;
						aIm -= wjkIm;
						tmp[ 0 ] = aRe;
						tmp[ 1 ] = aIm;
						tmp[ 2 ] = d12Re;
						tmp[ 3 ] = d12Im;
						cmplx.divAt( tmp, 4, tmp, 0, tmp, 2 );
						av[ oA + ( j * sa1 ) + ( ( k + 1 ) * sa2 ) ] = ( tRe * tmp[ 4 ] ) - ( tIm * tmp[ 5 ] );
						av[ oA + ( j * sa1 ) + ( ( k + 1 ) * sa2 ) + 1 ] = ( tRe * tmp[ 5 ] ) + ( tIm * tmp[ 4 ] );
					}
				}

				// Copy D(k) to A. zlasyf_rook keeps the sub-diagonal entry.
				av[ oA + ( k * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) ];
				av[ oA + ( k * sa1 ) + ( k * sa2 ) + 1 ] = wv[ oW + ( k * sw1 ) + ( k * sw2 ) + 1 ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) + 1 ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) + 1 ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
				av[ oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) + 1 ] = wv[ oW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) + 1 ];
			}
		}

		// Store details of the interchanges in IPIV
		if ( kstep === 1 ) {
			IPIV[ offsetIPIV + ( k * si ) ] = kp;
		} else {
			IPIV[ offsetIPIV + ( k * si ) ] = ~p;
			IPIV[ offsetIPIV + ( ( k + 1 ) * si ) ] = ~kp;
		}

		// Increase K and return to the start of the main loop
		k += kstep;
	}

	// Update the lower triangle of A22 (= A(k:N-1, k:N-1)) as
	//   A22 := A22 - L21*D*L21^T = A22 - L21*W^T
	for ( j = k; j < N; j += nb ) {
		jb = Math.min( nb, N - j );

		// Update the lower triangle of the diagonal block
		for ( jj = j; jj < j + jb; jj++ ) {
			zgemv( 'no-transpose', j + jb - jj, k, NEGCONE, A, strideA1, strideA2, offsetA + ( jj * strideA1 ), W, strideW2, offsetW + ( jj * strideW1 ), CONE, A, strideA1, offsetA + ( jj * strideA1 ) + ( jj * strideA2 ) );
		}

		// Update the rectangular subdiagonal block
		if ( j + jb < N ) {
			zgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, NEGCONE, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ), W, strideW1, strideW2, offsetW + ( j * strideW1 ), CONE, A, strideA1, strideA2, offsetA + ( ( j + jb ) * strideA1 ) + ( j * strideA2 ) );
		}
	}

	// Put L21 in standard form by partially undoing the interchanges in
	// Columns 0..k-1 looping backward from J = k-1.
	j = k - 1;
	while ( j >= 0 ) {
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
		if ( jp1 !== jj && kstep === 2 ) {
			zswap( j + 1, A, strideA2, offsetA + ( jp1 * strideA1 ), A, strideA2, offsetA + ( jj * strideA1 ) );
		}
	}

	// Set KB to the number of columns factorized
	return {
		'info': info,
		'kb': k
	};
}


// EXPORTS //

export default zlasyfRook;
