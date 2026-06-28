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

/* eslint-disable max-len, max-params */

// MODULES //

import idamax from '../../../../blas/base/idamax/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;


// MAIN //

/**
* Computes a partial factorization of a real symmetric matrix A using the.
* Bunch-Kaufman diagonal pivoting method. This is the blocked panel
* factorization used by dsytrf.
*
* The routine factorizes NB columns of A and returns the number of columns
* factored in the return value's `kb` field.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} W - workspace matrix, dimensions N x NB
* @param {integer} strideW1 - stride of the first dimension of W
* @param {integer} strideW2 - stride of the second dimension of W
* @param {NonNegativeInteger} offsetW - index offset for W
* @returns {Object} result - { info, kb } where info=0 on success, kb=columns factored
*/
function dlasyf( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var info;
	var imax;
	var jmax;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var d11;
	var d21;
	var d22;
	var kkw;
	var kw;
	var kk;
	var kp;
	var jb;
	var jj;
	var jp;
	var r1;
	var t;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	sw1 = strideW1;
	sw2 = strideW2;
	info = 0;

	if ( uplo === 'upper' ) {
		// Factorize the trailing columns of A using the upper triangle
		// K starts at N-1 (0-based) and decreases
		k = N - 1;
		while ( true ) {
			kw = nb + k - N; // 0-based column in W for column k (Fortran: KW = NB + K - N)

			// Check termination: if we've processed NB columns or k < 0
			if ( ( k <= N - nb && nb < N ) || k < 0 ) {
				break;
			}

			// Copy column k of A into column kw of W and update
			dcopy( k + 1, A, sa1, offsetA + (k * sa2), W, sw1, offsetW + (kw * sw2) );
			if ( k < N - 1 ) {
				// W(:,kw) -= A(:,k+1:N-1) * W(k,kw+1:nb-1)^T
				dgemv( 'no-transpose', k + 1, N - k - 1, -1.0, A, sa1, sa2, offsetA + (( k + 1 ) * sa2), W, sw2, offsetW + (k * sw1) + (( kw + 1 ) * sw2), 1.0, W, sw1, offsetW + (kw * sw2) );
			}

			kstep = 1;

			// Determine rows and columns to be interchanged
			absakk = Math.abs( W[ offsetW + (k * sw1) + (kw * sw2) ] );

			if ( k > 0 ) {
				imax = idamax( k, W, sw1, offsetW + (kw * sw2) );
				colmax = Math.abs( W[ offsetW + (imax * sw1) + (kw * sw2) ] );
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
					dcopy( imax + 1, A, sa1, offsetA + (imax * sa2), W, sw1, offsetW +( (( kw - 1 ) * sw2) ));
					dcopy( k - imax, A, sa2, offsetA + (imax * sa1) + (( imax + 1 ) * sa2), W, sw1, offsetW +( (( imax + 1 ) * sw1) )+( (( kw - 1 ) * sw2) ));
					if ( k < N - 1 ) {
						dgemv( 'no-transpose', k + 1, N - k - 1, -1.0, A, sa1, sa2, offsetA + (( k + 1 ) * sa2), W, sw2, offsetW + (imax * sw1) + (( kw + 1 ) * sw2), 1.0, W, sw1, offsetW +( (( kw - 1 ) * sw2) ));
					}

					// JMAX is the column-index of the largest off-diagonal element
					// In row IMAX, and ROWMAX is its absolute value
					jmax = imax + 1 + idamax( k - imax, W, sw1, offsetW +( (( imax + 1 ) * sw1) )+( (( kw - 1 ) * sw2) ));
					rowmax = Math.abs( W[ offsetW + (jmax * sw1) +( (( kw - 1 ) * sw2) )] );
					if ( imax > 0 ) {
						jmax = idamax( imax, W, sw1, offsetW +( (( kw - 1 ) * sw2) ));
						rowmax = Math.max( rowmax, Math.abs( W[ offsetW + (jmax * sw1) +( (( kw - 1 ) * sw2) )] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else if ( Math.abs( W[ offsetW + (imax * sw1) +( (( kw - 1 ) * sw2) )] ) >= ALPHA * rowmax ) {
						kp = imax;

						// Copy column kw-1 of W into column kw of W
						dcopy( k + 1, W, sw1, offsetW + (( kw - 1 ) * sw2), W, sw1, offsetW + (kw * sw2) );
					} else {
						kp = imax;
						kstep = 2;
					}
				}

				// Interchange rows and columns
				kk = k - kstep + 1;
				kkw = nb + kk - N; // 0-based (Fortran: KKW = NB + KK - N)

				if ( kp !== kk ) {
					// Interchange rows kp and kk
					A[ offsetA + (kp * sa1) + (kp * sa2) ] = A[ offsetA + (kk * sa1) + (kk * sa2) ];
					dcopy( kk - 1 - kp, A, sa1, offsetA +( (( kp + 1 ) * sa1) )+ (kk * sa2), A, sa2, offsetA + (kp * sa1) +( (( kp + 1 ) * sa2) ));
					if ( kp > 0 ) {
						dcopy( kp, A, sa1, offsetA + (kk * sa2), A, sa1, offsetA + (kp * sa2) );
					}

					// Interchange rows kk and kp in trailing columns
					if ( k < N - 1 ) {
						dswap( N - k - 1, A, sa2, offsetA + (kk * sa1) + (( k + 1 ) * sa2), A, sa2, offsetA + (kp * sa1) +( (( k + 1 ) * sa2) ));
					}
					dswap( N - kk, W, sw2, offsetW + (kk * sw1) + (kkw * sw2), W, sw2, offsetW + (kp * sw1) + (kkw * sw2) );
				}

				if ( kstep === 1 ) {
					// 1x1 pivot: copy W(kw) into A(k) and scale
					dcopy( k + 1, W, sw1, offsetW + (kw * sw2), A, sa1, offsetA + (k * sa2) );
					r1 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
					dscal( k, r1, A, sa1, offsetA + (k * sa2) );
				} else {
					// 2x2 pivot block
					if ( k > 1 ) {
						d21 = W[ offsetW +( (( k - 1 ) * sw1) )+ (kw * sw2) ];
						d11 = W[ offsetW + (k * sw1) + (kw * sw2) ] / d21;
						d22 = W[ offsetW +( (( k - 1 ) * sw1) )+( (( kw - 1 ) * sw2) )] / d21;
						t = 1.0 / ( (d11 * d22) - 1.0 );
						d21 = t / d21;

						for ( j = 0; j <= k - 2; j++ ) {
							A[ offsetA + (j * sa1) +( (( k - 1 ) * sa2) )] = d21 * ( (d11 * W[ offsetW + (j * sw1) +( (( kw - 1 ) * sw2) )]) - W[ offsetW + (j * sw1) + (kw * sw2) ] );
							A[ offsetA + (j * sa1) + (k * sa2) ] = d21 * ( (d22 * W[ offsetW + (j * sw1) + (kw * sw2) ]) - W[ offsetW + (j * sw1) +( (( kw - 1 ) * sw2) )] );
						}
					}

					// Copy D(k) back into A
					A[ offsetA +( (( k - 1 ) * sa1) )+( (( k - 1 ) * sa2) )] = W[ offsetW +( (( k - 1 ) * sw1) )+( (( kw - 1 ) * sw2) )];
					A[ offsetA +( (( k - 1 ) * sa1) )+ (k * sa2) ] = W[ offsetW +( (( k - 1 ) * sw1) )+ (kw * sw2) ];
					A[ offsetA + (k * sa1) + (k * sa2) ] = W[ offsetW + (k * sw1) + (kw * sw2) ];
				}
			}

			// Store IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
				IPIV[ offsetIPIV +( (( k - 1 ) * strideIPIV) )] = ~kp;
			}

			k -= kstep;
		}

		// Update the upper triangle: apply pending updates from W
		for ( j = Math.floor( k / nb ) * nb; j >= 0; j -= nb ) {
			jb = Math.min( nb, k - j + 1 );

			// Update the upper triangle of the diagonal block
			for ( jj = j; jj < j + jb; jj++ ) {
				dgemv( 'no-transpose', jj - j + 1, N - k - 1, -1.0, A, sa1, sa2, offsetA + (j * sa1) + (( k + 1 ) * sa2), W, sw2, offsetW + (jj * sw1) + (( kw + 1 ) * sw2), 1.0, A, sa1, offsetA + (j * sa1) + (jj * sa2) );
			}

			// Update the rectangular part above the diagonal block
			dgemm( 'no-transpose', 'transpose', j, jb, N - k - 1, -1.0, A, sa1, sa2, offsetA + (( k + 1 ) * sa2), W, sw1, sw2, offsetW + (j * sw1) + (( kw + 1 ) * sw2), 1.0, A, sa1, sa2, offsetA + (j * sa2) );
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
				dswap( N - j, A, sa2, offsetA + (jp * sa1) + (j * sa2), A, sa2, offsetA + (jj * sa1) + (j * sa2) );
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
		// Check termination: Fortran checks K >= NB (1-based), which is k >= nb-1 (0-based)
		if ( ( k >= nb - 1 && nb < N ) || k >= N ) {
			break;
		}

		// Copy column k of A into column k of W and update
		dcopy( N - k, A, sa1, offsetA + (k * sa1) + (k * sa2), W, sw1, offsetW + (k * sw1) + (k * sw2) );
		dgemv( 'no-transpose', N - k, k, -1.0, A, sa1, sa2, offsetA + (k * sa1), W, sw2, offsetW + (k * sw1), 1.0, W, sw1, offsetW + (k * sw1) + (k * sw2) );

		kstep = 1;
		absakk = Math.abs( W[ offsetW + (k * sw1) + (k * sw2) ] );

		if ( k < N - 1 ) {
			imax = k + 1 + idamax( N - k - 1, W, sw1, offsetW +( (( k + 1 ) * sw1) )+ (k * sw2) );
			colmax = Math.abs( W[ offsetW + (imax * sw1) + (k * sw2) ] );
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
				dcopy( imax - k, A, sa2, offsetA + (imax * sa1) + (k * sa2), W, sw1, offsetW + (k * sw1) +( (( k + 1 ) * sw2) ));
				dcopy( N - imax, A, sa1, offsetA + (imax * sa1) + (imax * sa2), W, sw1, offsetW + (imax * sw1) +( (( k + 1 ) * sw2) ));
				dgemv( 'no-transpose', N - k, k, -1.0, A, sa1, sa2, offsetA + (k * sa1), W, sw2, offsetW + (imax * sw1), 1.0, W, sw1, offsetW + (k * sw1) +( (( k + 1 ) * sw2) ));

				// Scan row imax for largest off-diagonal
				jmax = k + idamax( imax - k, W, sw1, offsetW + (k * sw1) +( (( k + 1 ) * sw2) ));
				rowmax = Math.abs( W[ offsetW + (jmax * sw1) +( (( k + 1 ) * sw2) )] );
				if ( imax < N - 1 ) {
					jmax = imax + 1 + idamax( N - imax - 1, W, sw1, offsetW +( (( imax + 1 ) * sw1) )+( (( k + 1 ) * sw2) ));
					rowmax = Math.max( rowmax, Math.abs( W[ offsetW + (jmax * sw1) +( (( k + 1 ) * sw2) )] ) );
				}

				if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
					kp = k;
				} else if ( Math.abs( W[ offsetW + (imax * sw1) +( (( k + 1 ) * sw2) )] ) >= ALPHA * rowmax ) {
					kp = imax;

					// Copy column k+1 of W into column k of W
					dcopy( N - k, W, sw1, offsetW + (k * sw1) + (( k + 1 ) * sw2), W, sw1, offsetW + (k * sw1) + (k * sw2) );
				} else {
					kp = imax;
					kstep = 2;
				}
			}

			kk = k + kstep - 1;

			if ( kp !== kk ) {
				// Interchange rows kp and kk
				A[ offsetA + (kp * sa1) + (kp * sa2) ] = A[ offsetA + (kk * sa1) + (kk * sa2) ];
				dcopy( kp - kk - 1, A, sa1, offsetA +( (( kk + 1 ) * sa1) )+ (kk * sa2), A, sa2, offsetA + (kp * sa1) +( (( kk + 1 ) * sa2) ));
				if ( kp < N - 1 ) {
					dcopy( N - kp - 1, A, sa1, offsetA +( (( kp + 1 ) * sa1) )+ (kk * sa2), A, sa1, offsetA +( (( kp + 1 ) * sa1) )+ (kp * sa2) );
				}

				// Interchange rows kk and kp in columns 0..k-1
				if ( k > 0 ) {
					dswap( k, A, sa2, offsetA + (kk * sa1), A, sa2, offsetA + (kp * sa1) );
				}
				dswap( kk + 1, W, sw2, offsetW + (kk * sw1), W, sw2, offsetW + (kp * sw1) );
			}

			if ( kstep === 1 ) {
				dcopy( N - k, W, sw1, offsetW + (k * sw1) + (k * sw2), A, sa1, offsetA + (k * sa1) + (k * sa2) );
				if ( k < N - 1 ) {
					r1 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
					dscal( N - k - 1, r1, A, sa1, offsetA +( (( k + 1 ) * sa1) )+ (k * sa2) );
				}
			} else {
				// 2x2 pivot block
				if ( k < N - 2 ) {
					d21 = W[ offsetW +( (( k + 1 ) * sw1) )+ (k * sw2) ];
					d11 = W[ offsetW +( (( k + 1 ) * sw1) )+( (( k + 1 ) * sw2) )] / d21;
					d22 = W[ offsetW + (k * sw1) + (k * sw2) ] / d21;
					t = 1.0 / ( (d11 * d22) - 1.0 );
					d21 = t / d21;

					for ( j = k + 2; j < N; j++ ) {
						A[ offsetA + (j * sa1) + (k * sa2) ] = d21 * ( (d11 * W[ offsetW + (j * sw1) + (k * sw2) ]) - W[ offsetW + (j * sw1) +( (( k + 1 ) * sw2) )] );
						A[ offsetA + (j * sa1) +( (( k + 1 ) * sa2) )] = d21 * ( (d22 * W[ offsetW + (j * sw1) +( (( k + 1 ) * sw2) )]) - W[ offsetW + (j * sw1) + (k * sw2) ] );
					}
				}

				A[ offsetA + (k * sa1) + (k * sa2) ] = W[ offsetW + (k * sw1) + (k * sw2) ];
				A[ offsetA +( (( k + 1 ) * sa1) )+ (k * sa2) ] = W[ offsetW +( (( k + 1 ) * sw1) )+ (k * sw2) ];
				A[ offsetA +( (( k + 1 ) * sa1) )+( (( k + 1 ) * sa2) )] = W[ offsetW +( (( k + 1 ) * sw1) )+( (( k + 1 ) * sw2) )];
			}
		}

		// Store IPIV
		if ( kstep === 1 ) {
			IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
		} else {
			IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
			IPIV[ offsetIPIV +( (( k + 1 ) * strideIPIV) )] = ~kp;
		}

		k += kstep;
	}

	// Update lower triangle: apply pending updates
	for ( j = k; j < N; j += nb ) {
		jb = Math.min( nb, N - j );

		// Update the lower triangle of the diagonal block
		for ( jj = j; jj < j + jb; jj++ ) {
			dgemv( 'no-transpose', j + jb - jj, k, -1.0, A, sa1, sa2, offsetA + (jj * sa1), W, sw2, offsetW + (jj * sw1), 1.0, A, sa1, offsetA + (jj * sa1) + (jj * sa2) );
		}

		// Update the rectangular part below the diagonal block
		if ( j + jb < N ) {
			dgemm( 'no-transpose', 'transpose', N - j - jb, jb, k, -1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1), W, sw1, sw2, offsetW + (j * sw1), 1.0, A, sa1, sa2, offsetA +( (( j + jb ) * sa1) )+ (j * sa2) );
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
			dswap( j + 1, A, sa2, offsetA + (jp * sa1), A, sa2, offsetA + (jj * sa1) );
		}
	}

	return {
		'info': info,
		'kb': k
	};
}


// EXPORTS //

export default dlasyf;
