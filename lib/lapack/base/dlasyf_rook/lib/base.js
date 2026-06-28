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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth, max-lines */

// MODULES //

import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ALPHA_CONST = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;


// MAIN //

/**
* Computes a partial factorization of a real symmetric matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* ## Notes
*
* -   The routine factorizes at most `nb` columns of the trailing (upper) or leading (lower) submatrix of `A` and returns the number of columns actually factored in `kb`.
* -   Pivot indices follow the stdlib bitwise-NOT convention: 1x1 pivots use non-negative indices; 2x2 pivots use `~p` (bitwise NOT) for both rows of the block.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Int32Array} IPIV - pivot index output array (length `N`)
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Float64Array} W - workspace matrix (`N x nb`)
* @param {integer} strideW1 - stride of the first dimension of `W`
* @param {integer} strideW2 - stride of the second dimension of `W`
* @param {NonNegativeInteger} offsetW - index offset for `W`
* @returns {Object} result `{ info, kb }` where `info = 0` on success, `info = k+1` (1-based) if the `k`-th pivot is exactly zero
*/
function dlasyfRook( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var dtemp;
	var itemp;
	var done;
	var info;
	var imax;
	var jmax;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var d11;
	var d12;
	var d21;
	var d22;
	var kkw;
	var si;
	var kw;
	var kk;
	var kp;
	var jb;
	var jj;
	var r1;
	var ii;
	var jp1;
	var jp2;
	var p;
	var t;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	sw1 = strideW1;
	sw2 = strideW2;
	si = strideIPIV;
	info = 0;

	if ( uplo === 'upper' ) {
		// K is the main loop index, decreasing from N-1 (0-based)
		k = N - 1;
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
			dcopy( k + 1, A, sa1, offsetA + ( k * sa2 ), W, sw1, offsetW + ( kw * sw2 ) );
			if ( k < N - 1 ) {
				dgemv( 'no-transpose', k + 1, N - 1 - k, -1.0, A, sa1, sa2, offsetA + ( ( k + 1 ) * sa2 ), W, sw2, offsetW + ( k * sw1 ) + ( ( kw + 1 ) * sw2 ), 1.0, W, sw1, offsetW + ( kw * sw2 ) );
			}

			// Determine rows and columns to be interchanged
			absakk = Math.abs( W[ offsetW + ( k * sw1 ) + ( kw * sw2 ) ] );

			if ( k > 0 ) {
				imax = idamax( k, W, sw1, offsetW + ( kw * sw2 ) );
				colmax = Math.abs( W[ offsetW + ( imax * sw1 ) + ( kw * sw2 ) ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column K is zero or underflow: set INFO and continue
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				dcopy( k + 1, W, sw1, offsetW + ( kw * sw2 ), A, sa1, offsetA + ( k * sa2 ) );
			} else {
				// Test for interchange
				if ( absakk >= ALPHA_CONST * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					done = false;

					// Start pivot search loop (rook pivoting)
					while ( true ) {
						// Copy column IMAX to column KW-1 of W and update it
						dcopy( imax + 1, A, sa1, offsetA + ( imax * sa2 ), W, sw1, offsetW + ( ( kw - 1 ) * sw2 ) );
						dcopy( k - imax, A, sa2, offsetA + ( imax * sa1 ) + ( ( imax + 1 ) * sa2 ), W, sw1, offsetW + ( ( imax + 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) );

						if ( k < N - 1 ) {
							dgemv( 'no-transpose', k + 1, N - 1 - k, -1.0, A, sa1, sa2, offsetA + ( ( k + 1 ) * sa2 ), W, sw2, offsetW + ( imax * sw1 ) + ( ( kw + 1 ) * sw2 ), 1.0, W, sw1, offsetW + ( ( kw - 1 ) * sw2 ) );
						}

						// JMAX is column-index of largest off-diagonal in row IMAX
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
							jmax = imax + 1 + idamax( k - imax, W, sw1, offsetW + ( ( imax + 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) );
							rowmax = Math.abs( W[ offsetW + ( jmax * sw1 ) + ( ( kw - 1 ) * sw2 ) ] );
						}

						if ( imax > 0 ) {
							itemp = idamax( imax, W, sw1, offsetW + ( ( kw - 1 ) * sw2 ) );
							dtemp = Math.abs( W[ offsetW + ( itemp * sw1 ) + ( ( kw - 1 ) * sw2 ) ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						// Equivalent to testing for ABS(W(IMAX,KW-1)) >= ALPHA*ROWMAX
						if ( Math.abs( W[ offsetW + ( imax * sw1 ) + ( ( kw - 1 ) * sw2 ) ] ) >= ALPHA_CONST * rowmax ) {
							// Interchange rows and columns K and IMAX: use 1x1 pivot
							kp = imax;

							// Copy column KW-1 of W to column KW of W
							dcopy( k + 1, W, sw1, offsetW + ( ( kw - 1 ) * sw2 ), W, sw1, offsetW + ( kw * sw2 ) );
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
							dcopy( k + 1, W, sw1, offsetW + ( ( kw - 1 ) * sw2 ), W, sw1, offsetW + ( kw * sw2 ) );
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

				// Interchange rows and columns P and K.

				// Updated column P is already stored in column KW of W.
				if ( kstep === 2 && p !== k ) {
					// Copy non-updated column K to column P of A (upper rows)
					// Fortran: DCOPY( K-P, A( P+1, K ), 1, A( P, P+1 ), LDA )
					dcopy( k - p, A, sa1, offsetA + ( ( p + 1 ) * sa1 ) + ( k * sa2 ), A, sa2, offsetA + ( p * sa1 ) + ( ( p + 1 ) * sa2 ) );

					// Fortran: DCOPY( P, A( 1, K ), 1, A( 1, P ), 1 )
					dcopy( p, A, sa1, offsetA + ( k * sa2 ), A, sa1, offsetA + ( p * sa2 ) );

					// Interchange rows K and P in the last K..N-1 columns of A.

					// Fortran: DSWAP( N-K+1, A( K, K ), LDA, A( P, K ), LDA )
					dswap( N - k, A, sa2, offsetA + ( k * sa1 ) + ( k * sa2 ), A, sa2, offsetA + ( p * sa1 ) + ( k * sa2 ) );

					// Interchange rows K and P in last KKW to NB columns of W.

					// Fortran: DSWAP( N-KK+1, W( K, KKW ), LDW, W( P, KKW ), LDW )
					dswap( N - kk, W, sw2, offsetW + ( k * sw1 ) + ( kkw * sw2 ), W, sw2, offsetW + ( p * sw1 ) + ( kkw * sw2 ) );
				}

				// Interchange rows and columns KP and KK.
				// Updated column KP is already stored in column KKW of W.
				if ( kp !== kk ) {
					// Copy non-updated column KK to column KP of submatrix A at step K.
					A[ offsetA + ( kp * sa1 ) + ( kp * sa2 ) ] = A[ offsetA + ( kk * sa1 ) + ( kk * sa2 ) ];

					// Fortran: DCOPY( K-1-KP, A( KP+1, KK ), 1, A( KP, KP+1 ), LDA )
					dcopy( kk - 1 - kp, A, sa1, offsetA + ( ( kp + 1 ) * sa1 ) + ( kk * sa2 ), A, sa2, offsetA + ( kp * sa1 ) + ( ( kp + 1 ) * sa2 ) );

					// Fortran: DCOPY( KP, A( 1, KK ), 1, A( 1, KP ), 1 )
					dcopy( kp, A, sa1, offsetA + ( kk * sa2 ), A, sa1, offsetA + ( kp * sa2 ) );

					// Interchange rows KK and KP in last K+1 to N columns of A.

					// Fortran: DSWAP( N-KK+1, A( KK, KK ), LDA, A( KP, KK ), LDA )

					// Note: for upper path, DSWAP is on submatrix starting at column KK going to N-1.

					// But only columns K+1..N-1 should be swapped (columns KK..K are overwritten or handled separately).

					// Wait — the Fortran writes DSWAP(N-KK+1, A(KK,KK), A(KP,KK)). This swaps columns KK..N-1.

					// Fortran dlasyf_rook uses N-KK+1 which means columns KK..N (1-based), i.e., (kk..N-1) 0-based — DIFFERENT from dlasyf_rk which swaps only N-K-1 columns starting at K+1.
					dswap( N - kk, A, sa2, offsetA + ( kk * sa1 ) + ( kk * sa2 ), A, sa2, offsetA + ( kp * sa1 ) + ( kk * sa2 ) );

					// Interchange rows KK and KP in last KKW to NB columns of W.

					// Fortran: DSWAP( N-KK+1, W( KK, KKW ), LDW, W( KP, KKW ), LDW )
					dswap( N - kk, W, sw2, offsetW + ( kk * sw1 ) + ( kkw * sw2 ), W, sw2, offsetW + ( kp * sw1 ) + ( kkw * sw2 ) );
				}

				if ( kstep === 1 ) {
					// 1x1 pivot block D(k): column k of W now holds
					//   W(k) = U(k)*D(k)
					// Where U(k) is the k-th column of U. Store U(k) in column k of A.
					dcopy( k + 1, W, sw1, offsetW + ( kw * sw2 ), A, sa1, offsetA + ( k * sa2 ) );
					if ( k > 0 ) {
						if ( Math.abs( A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] ) >= SFMIN ) {
							r1 = 1.0 / A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
							dscal( k, r1, A, sa1, offsetA + ( k * sa2 ) );
						} else if ( A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] !== 0.0 ) {
							for ( ii = 0; ii < k; ii++ ) {
								A[ offsetA + ( ii * sa1 ) + ( k * sa2 ) ] /= A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
							}
						}
					}
				} else {
					// 2x2 pivot block D(k): columns k and k-1 of W now hold
					//   ( W(k-1) W(k) ) = ( U(k-1) U(k) )*D(k)
					if ( k > 1 ) {
						// Compose D from columns k-1 and k of W
						d12 = W[ offsetW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
						d11 = W[ offsetW + ( k * sw1 ) + ( kw * sw2 ) ] / d12;
						d22 = W[ offsetW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ] / d12;
						t = 1.0 / ( ( d11 * d22 ) - 1.0 );

						for ( j = 0; j <= k - 2; j++ ) {
							A[ offsetA + ( j * sa1 ) + ( ( k - 1 ) * sa2 ) ] = t * ( ( ( d11 * W[ offsetW + ( j * sw1 ) + ( ( kw - 1 ) * sw2 ) ] ) - W[ offsetW + ( j * sw1 ) + ( kw * sw2 ) ] ) / d12 );
							A[ offsetA + ( j * sa1 ) + ( k * sa2 ) ] = t * ( ( ( d22 * W[ offsetW + ( j * sw1 ) + ( kw * sw2 ) ] ) - W[ offsetW + ( j * sw1 ) + ( ( kw - 1 ) * sw2 ) ] ) / d12 );
						}
					}

					// Copy D(k) to A. NOTE: dlasyf_rook keeps the super-diagonal entry (no zero-out).
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 ) ] = W[ offsetW + ( ( k - 1 ) * sw1 ) + ( ( kw - 1 ) * sw2 ) ];
					A[ offsetA + ( ( k - 1 ) * sa1 ) + ( k * sa2 ) ] = W[ offsetW + ( ( k - 1 ) * sw1 ) + ( kw * sw2 ) ];
					A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = W[ offsetW + ( k * sw1 ) + ( kw * sw2 ) ];
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
				dgemv( 'no-transpose', jj - j + 1, N - 1 - k, -1.0, A, sa1, sa2, offsetA + ( j * sa1 ) + ( ( k + 1 ) * sa2 ), W, sw2, offsetW + ( jj * sw1 ) + ( ( kw + 1 ) * sw2 ), 1.0, A, sa1, offsetA + ( j * sa1 ) + ( jj * sa2 ) );
			}

			// Update the rectangular superdiagonal block
			if ( j >= 1 ) {
				dgemm( 'no-transpose', 'transpose', j, jb, N - 1 - k, -1.0, A, sa1, sa2, offsetA + ( ( k + 1 ) * sa2 ), W, sw1, sw2, offsetW + ( j * sw1 ) + ( ( kw + 1 ) * sw2 ), 1.0, A, sa1, sa2, offsetA + ( j * sa2 ) );
			}
		}

		// Put U12 in standard form by partially undoing the interchanges in columns
		// k+1..N-1 looping backward from J = k+1.
		// Fortran reference (1-based):
		//   J = K + 1
		//   60 CONTINUE
		//      KSTEP = 1; JP1 = 1; JJ = J; JP2 = IPIV( J )
		//      IF( JP2.LT.0 ) THEN
		//        JP2 = -JP2; J = J + 1; JP1 = -IPIV( J ); KSTEP = 2
		//      END IF
		//      J = J + 1
		//      IF( JP2.NE.JJ .AND. J.LE.N ) DSWAP( N-J+1, A( JP2, J ), LDA, A( JJ, J ), LDA )
		//      JJ = J - 1
		//      IF( JP1.NE.JJ .AND. KSTEP.EQ.2 ) DSWAP( N-J+1, A( JP1, J ), LDA, A( JJ, J ), LDA )
		//   IF( J.LE.N ) GOTO 60
		// 0-based JS translation: note IPIV encodes 2x2 pivots as ~p (bitwise NOT).
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
				dswap( N - j, A, sa2, offsetA + ( jp2 * sa1 ) + ( j * sa2 ), A, sa2, offsetA + ( jj * sa1 ) + ( j * sa2 ) );
			}
			jj = j - 1;
			if ( jp1 !== jj && kstep === 2 ) {
				dswap( N - j, A, sa2, offsetA + ( jp1 * sa1 ) + ( j * sa2 ), A, sa2, offsetA + ( jj * sa1 ) + ( j * sa2 ) );
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
		dcopy( N - k, A, sa1, offsetA + ( k * sa1 ) + ( k * sa2 ), W, sw1, offsetW + ( k * sw1 ) + ( k * sw2 ) );
		if ( k > 0 ) {
			dgemv( 'no-transpose', N - k, k, -1.0, A, sa1, sa2, offsetA + ( k * sa1 ), W, sw2, offsetW + ( k * sw1 ), 1.0, W, sw1, offsetW + ( k * sw1 ) + ( k * sw2 ) );
		}

		// Determine rows and columns to be interchanged
		absakk = Math.abs( W[ offsetW + ( k * sw1 ) + ( k * sw2 ) ] );

		if ( k < N - 1 ) {
			imax = k + 1 + idamax( N - 1 - k, W, sw1, offsetW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) );
			colmax = Math.abs( W[ offsetW + ( imax * sw1 ) + ( k * sw2 ) ] );
		} else {
			colmax = 0.0;
		}

		if ( Math.max( absakk, colmax ) === 0.0 ) {
			// Column K is zero or underflow: set INFO and continue
			if ( info === 0 ) {
				info = k + 1;
			}
			kp = k;
			dcopy( N - k, W, sw1, offsetW + ( k * sw1 ) + ( k * sw2 ), A, sa1, offsetA + ( k * sa1 ) + ( k * sa2 ) );
		} else {
			// Test for interchange
			if ( absakk >= ALPHA_CONST * colmax ) {
				kp = k;
			} else {
				done = false;

				while ( true ) {
					// Copy column IMAX to column K+1 of W and update it
					dcopy( imax - k, A, sa2, offsetA + ( imax * sa1 ) + ( k * sa2 ), W, sw1, offsetW + ( k * sw1 ) + ( ( k + 1 ) * sw2 ) );
					dcopy( N - imax, A, sa1, offsetA + ( imax * sa1 ) + ( imax * sa2 ), W, sw1, offsetW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) );

					if ( k > 0 ) {
						dgemv( 'no-transpose', N - k, k, -1.0, A, sa1, sa2, offsetA + ( k * sa1 ), W, sw2, offsetW + ( imax * sw1 ), 1.0, W, sw1, offsetW + ( k * sw1 ) + ( ( k + 1 ) * sw2 ) );
					}

					// JMAX is column-index of largest off-diagonal in row IMAX
					if ( imax === k ) {
						rowmax = 0.0;
					} else {
						jmax = k + idamax( imax - k, W, sw1, offsetW + ( k * sw1 ) + ( ( k + 1 ) * sw2 ) );
						rowmax = Math.abs( W[ offsetW + ( jmax * sw1 ) + ( ( k + 1 ) * sw2 ) ] );
					}

					if ( imax < N - 1 ) {
						itemp = imax + 1 + idamax( N - 1 - imax, W, sw1, offsetW + ( ( imax + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) );
						dtemp = Math.abs( W[ offsetW + ( itemp * sw1 ) + ( ( k + 1 ) * sw2 ) ] );
						if ( dtemp > rowmax ) {
							rowmax = dtemp;
							jmax = itemp;
						}
					}

					// Equivalent to testing for ABS(W(IMAX,K+1)) >= ALPHA*ROWMAX
					if ( Math.abs( W[ offsetW + ( imax * sw1 ) + ( ( k + 1 ) * sw2 ) ] ) >= ALPHA_CONST * rowmax ) {
						// Interchange rows and columns K and IMAX: use 1x1 pivot
						kp = imax;

						// Copy column K+1 of W to column K of W
						dcopy( N - k, W, sw1, offsetW + ( k * sw1 ) + ( ( k + 1 ) * sw2 ), W, sw1, offsetW + ( k * sw1 ) + ( k * sw2 ) );
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
						dcopy( N - k, W, sw1, offsetW + ( k * sw1 ) + ( ( k + 1 ) * sw2 ), W, sw1, offsetW + ( k * sw1 ) + ( k * sw2 ) );
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
				// Fortran: DCOPY( P-K, A( K, K ), 1, A( P, K ), LDA )
				dcopy( p - k, A, sa1, offsetA + ( k * sa1 ) + ( k * sa2 ), A, sa2, offsetA + ( p * sa1 ) + ( k * sa2 ) );

				// Fortran: DCOPY( N-P+1, A( P, K ), 1, A( P, P ), 1 )
				dcopy( N - p, A, sa1, offsetA + ( p * sa1 ) + ( k * sa2 ), A, sa1, offsetA + ( p * sa1 ) + ( p * sa2 ) );

				// Interchange rows K and P in first K columns of A and first KK columns of W.

				// Fortran: DSWAP( K, A( K, 1 ), LDA, A( P, 1 ), LDA ) — K Fortran-1-based

				// Columns is k+1 0-based columns (cols 0..k inclusive).
				dswap( k + 1, A, sa2, offsetA + ( k * sa1 ), A, sa2, offsetA + ( p * sa1 ) );

				// Fortran: DSWAP( KK, W( K, 1 ), LDW, W( P, 1 ), LDW ) — KK Fortran-1-based

				// Columns is kk+1 0-based columns.
				dswap( kk + 1, W, sw2, offsetW + ( k * sw1 ), W, sw2, offsetW + ( p * sw1 ) );
			}

			// Interchange rows and columns KP and KK.
			// Updated column KP is already stored in column KK of W.
			if ( kp !== kk ) {
				// Fortran: A( KP, K ) = A( KK, K ) — column index is K (block start), not KK/KP.
				A[ offsetA + ( kp * sa1 ) + ( k * sa2 ) ] = A[ offsetA + ( kk * sa1 ) + ( k * sa2 ) ];

				// Fortran: DCOPY( KP-K-1, A( K+1, KK ), 1, A( KP, K+1 ), LDA )
				dcopy( kp - k - 1, A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( kk * sa2 ), A, sa2, offsetA + ( kp * sa1 ) + ( ( k + 1 ) * sa2 ) );

				// Fortran: DCOPY( N-KP+1, A( KP, KK ), 1, A( KP, KP ), 1 ) — N-kp 0-based elements.
				dcopy( N - kp, A, sa1, offsetA + ( kp * sa1 ) + ( kk * sa2 ), A, sa1, offsetA + ( kp * sa1 ) + ( kp * sa2 ) );

				// Interchange rows KK and KP in first KK columns of A and W.

				// Fortran: DSWAP( KK, A( KK, 1 ), LDA, A( KP, 1 ), LDA ) — KK Fortran 1-based

				// Columns is kk+1 0-based columns (cols 0..kk inclusive).
				dswap( kk + 1, A, sa2, offsetA + ( kk * sa1 ), A, sa2, offsetA + ( kp * sa1 ) );

				// Fortran: DSWAP( KK, W( KK, 1 ), LDW, W( KP, 1 ), LDW )
				dswap( kk + 1, W, sw2, offsetW + ( kk * sw1 ), W, sw2, offsetW + ( kp * sw1 ) );
			}

			if ( kstep === 1 ) {
				// 1x1 pivot block D(k): column k of W now holds
				//   W(k) = L(k)*D(k). Store L(k) in column k of A.
				dcopy( N - k, W, sw1, offsetW + ( k * sw1 ) + ( k * sw2 ), A, sa1, offsetA + ( k * sa1 ) + ( k * sa2 ) );
				if ( k < N - 1 ) {
					if ( Math.abs( A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] ) >= SFMIN ) {
						r1 = 1.0 / A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
						dscal( N - 1 - k, r1, A, sa1, offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) );
					} else if ( A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] !== 0.0 ) {
						for ( ii = k + 1; ii < N; ii++ ) {
							A[ offsetA + ( ii * sa1 ) + ( k * sa2 ) ] /= A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ];
						}
					}
				}
			} else {
				// 2x2 pivot block D(k)
				if ( k < N - 2 ) {
					d21 = W[ offsetW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
					d11 = W[ offsetW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ] / d21;
					d22 = W[ offsetW + ( k * sw1 ) + ( k * sw2 ) ] / d21;
					t = 1.0 / ( ( d11 * d22 ) - 1.0 );

					for ( j = k + 2; j < N; j++ ) {
						A[ offsetA + ( j * sa1 ) + ( k * sa2 ) ] = t * ( ( ( d11 * W[ offsetW + ( j * sw1 ) + ( k * sw2 ) ] ) - W[ offsetW + ( j * sw1 ) + ( ( k + 1 ) * sw2 ) ] ) / d21 );
						A[ offsetA + ( j * sa1 ) + ( ( k + 1 ) * sa2 ) ] = t * ( ( ( d22 * W[ offsetW + ( j * sw1 ) + ( ( k + 1 ) * sw2 ) ] ) - W[ offsetW + ( j * sw1 ) + ( k * sw2 ) ] ) / d21 );
					}
				}

				// Copy D(k) to A. dlasyf_rook keeps the sub-diagonal entry.
				A[ offsetA + ( k * sa1 ) + ( k * sa2 ) ] = W[ offsetW + ( k * sw1 ) + ( k * sw2 ) ];
				A[ offsetA + ( ( k + 1 ) * sa1 ) + ( k * sa2 ) ] = W[ offsetW + ( ( k + 1 ) * sw1 ) + ( k * sw2 ) ];
				A[ offsetA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 ) ] = W[ offsetW + ( ( k + 1 ) * sw1 ) + ( ( k + 1 ) * sw2 ) ];
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
			dgemv( 'no-transpose', j + jb - jj, k, -1.0, A, sa1, sa2, offsetA + ( jj * sa1 ), W, sw2, offsetW + ( jj * sw1 ), 1.0, A, sa1, offsetA + ( jj * sa1 ) + ( jj * sa2 ) );
		}

		// Update the rectangular subdiagonal block
		if ( j + jb < N ) {
			dgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, -1.0, A, sa1, sa2, offsetA + ( ( j + jb ) * sa1 ), W, sw1, sw2, offsetW + ( j * sw1 ), 1.0, A, sa1, sa2, offsetA + ( ( j + jb ) * sa1 ) + ( j * sa2 ) );
		}
	}

	// Put L21 in standard form by partially undoing the interchanges in columns
	// 0..k-1 looping backward from J = k-1.
	// Fortran reference (1-based):
	//   J = K - 1
	//   120 CONTINUE
	//      KSTEP = 1; JP1 = 1; JJ = J; JP2 = IPIV( J )
	//      IF( JP2.LT.0 ) THEN
	//        JP2 = -JP2; J = J - 1; JP1 = -IPIV( J ); KSTEP = 2
	//      END IF
	//      J = J - 1
	//      IF( JP2.NE.JJ .AND. J.GE.1 ) DSWAP( J, A( JP2, 1 ), LDA, A( JJ, 1 ), LDA )
	//      JJ = J + 1
	//      IF( JP1.NE.JJ .AND. KSTEP.EQ.2 ) DSWAP( J, A( JP1, 1 ), LDA, A( JJ, 1 ), LDA )
	//   IF( J.GE.1 ) GOTO 120
	// 0-based JS: J starts at k-1, decrements; Fortran J>=1 → JS J>=0. DSWAP length J
	// (Fortran) → J+1 (0-based count of leading columns 0..J).
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
			dswap( j + 1, A, sa2, offsetA + ( jp2 * sa1 ), A, sa2, offsetA + ( jj * sa1 ) );
		}
		jj = j + 1;
		if ( jp1 !== jj && kstep === 2 ) {
			dswap( j + 1, A, sa2, offsetA + ( jp1 * sa1 ), A, sa2, offsetA + ( jj * sa1 ) );
		}
	}

	// Set KB to the number of columns factorized
	return {
		'info': info,
		'kb': k
	};
}


// EXPORTS //

export default dlasyfRook;
