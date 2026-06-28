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

/* eslint-disable max-len, max-lines-per-function, max-statements, max-depth, no-lonely-if */

// MODULES //

import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// MAIN //

/**
* Solves one of the matrix equations `op(A)_X = alpha_B` or `X_op(A) = alpha_B` where alpha is a scalar, X and B are M-by-N matrices, A is a unit or non-unit, upper or lower triangular matrix stored in Rectangular Full Packed (RFP) format, and `op(A)` is `A` or `A^T`. The matrix X is overwritten on B.
*
* @private
* @param {string} transr - specifies the storage format of A (`'no-transpose'` or `'transpose'`)
* @param {string} side - specifies whether op(A) appears on the left or right (`'left'` or `'right'`)
* @param {string} uplo - specifies whether the RFP matrix A is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} trans - specifies the transpose operation on A (`'no-transpose'` or `'transpose'`)
* @param {string} diag - specifies whether A has unit diagonal (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier
* @param {Float64Array} A - RFP array of length K*(K+1)/2 where K=M (if SIDE='left') or K=N (if SIDE='right')
* @param {integer} strideA - stride for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - M-by-N input/output matrix (overwritten with X)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
*/
function dtfsm( transr, side, uplo, trans, diag, M, N, alpha, A, strideA, offsetA, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-params
	var normalTransr;
	var notrans;
	var misodd;
	var nisodd;
	var lower;
	var lside;
	var sb1;
	var sb2;
	var sa;
	var m1;
	var m2;
	var n1;
	var n2;
	var k;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return;
	}

	normalTransr = ( transr === 'no-transpose' );
	lside = ( side === 'left' );
	lower = ( uplo === 'lower' );
	notrans = ( trans === 'no-transpose' );

	sa = strideA;
	sb1 = strideB1;
	sb2 = strideB2;

	// When alpha is zero, set B to zero and return
	if ( alpha === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				B[ offsetB + ( sb1 * i ) + ( sb2 * j ) ] = 0.0;
			}
		}
		return;
	}

	if ( lside ) {
		// SIDE = 'L': op(A) * X = alpha * B, A is M x M

		if ( M % 2 === 0 ) {
			misodd = false;
			k = M / 2;
		} else {
			misodd = true;
			if ( lower ) {
				m2 = Math.floor( M / 2 );
				m1 = M - m2;
			} else {
				m1 = Math.floor( M / 2 );
				m2 = M - m1;
			}
		}

		if ( misodd ) {
			// M is odd
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = M
				if ( lower ) {
					if ( notrans ) {
						// SIDE='L', TRANSR='N', UPLO='L', TRANS='N'
						if ( M === 1 ) {
							dtrsm( 'left', 'lower', 'no-transpose', diag, m1, N, alpha, A, sa, sa * M, offsetA, B, sb1, sb2, offsetB );
						} else {
							dtrsm( 'left', 'lower', 'no-transpose', diag, m1, N, alpha, A, sa, sa * M, offsetA, B, sb1, sb2, offsetB );
							dgemm( 'no-transpose', 'no-transpose', m2, N, m1, -1.0, A, sa, sa * M, offsetA + ( sa * m1 ), B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * m1 ) );
							dtrsm( 'left', 'upper', 'transpose', diag, m2, N, 1.0, A, sa, sa * M, offsetA + ( sa * M ), B, sb1, sb2, offsetB + ( sb1 * m1 ) );
						}
					} else {
						// SIDE='L', TRANSR='N', UPLO='L', TRANS='T'
						if ( M === 1 ) {
							dtrsm( 'left', 'lower', 'transpose', diag, m1, N, alpha, A, sa, sa * M, offsetA, B, sb1, sb2, offsetB );
						} else {
							dtrsm( 'left', 'upper', 'no-transpose', diag, m2, N, alpha, A, sa, sa * M, offsetA + ( sa * M ), B, sb1, sb2, offsetB + ( sb1 * m1 ) );
							dgemm( 'transpose', 'no-transpose', m1, N, m2, -1.0, A, sa, sa * M, offsetA + ( sa * m1 ), B, sb1, sb2, offsetB + ( sb1 * m1 ), alpha, B, sb1, sb2, offsetB );
							dtrsm( 'left', 'lower', 'transpose', diag, m1, N, 1.0, A, sa, sa * M, offsetA, B, sb1, sb2, offsetB );
						}
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='L', TRANSR='N', UPLO='U', TRANS='N'
						dtrsm( 'left', 'upper', 'no-transpose', diag, m2, N, alpha, A, sa, sa * M, offsetA + ( sa * m1 ), B, sb1, sb2, offsetB + ( sb1 * m1 ) );
						dgemm( 'no-transpose', 'no-transpose', m1, N, m2, -1.0, A, sa, sa * M, offsetA, B, sb1, sb2, offsetB + ( sb1 * m1 ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'left', 'lower', 'transpose', diag, m1, N, 1.0, A, sa, sa * M, offsetA + ( sa * m2 ), B, sb1, sb2, offsetB );
					} else {
						// SIDE='L', TRANSR='N', UPLO='U', TRANS='T'
						dtrsm( 'left', 'lower', 'no-transpose', diag, m1, N, alpha, A, sa, sa * M, offsetA + ( sa * m2 ), B, sb1, sb2, offsetB );
						dgemm( 'transpose', 'no-transpose', m2, N, m1, -1.0, A, sa, sa * M, offsetA, B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * m1 ) );
						dtrsm( 'left', 'upper', 'transpose', diag, m2, N, 1.0, A, sa, sa * M, offsetA + ( sa * m1 ), B, sb1, sb2, offsetB + ( sb1 * m1 ) );
					}
				}
			} else {
				// TRANSR = 'T', LDA = M1
				if ( lower ) {
					if ( notrans ) {
						// SIDE='L', TRANSR='T', UPLO='L', TRANS='N'
						if ( M === 1 ) {
							dtrsm( 'left', 'upper', 'transpose', diag, m1, N, alpha, A, sa, sa * m1, offsetA, B, sb1, sb2, offsetB );
						} else {
							dtrsm( 'left', 'upper', 'transpose', diag, m1, N, alpha, A, sa, sa * m1, offsetA, B, sb1, sb2, offsetB );
							dgemm( 'transpose', 'no-transpose', m2, N, m1, -1.0, A, sa, sa * m1, offsetA + ( sa * m1 * m1 ), B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * m1 ) );
							dtrsm( 'left', 'lower', 'no-transpose', diag, m2, N, 1.0, A, sa, sa * m1, offsetA + sa, B, sb1, sb2, offsetB + ( sb1 * m1 ) );
						}
					} else {
						// SIDE='L', TRANSR='T', UPLO='L', TRANS='T'
						if ( M === 1 ) {
							dtrsm( 'left', 'upper', 'no-transpose', diag, m1, N, alpha, A, sa, sa * m1, offsetA, B, sb1, sb2, offsetB );
						} else {
							dtrsm( 'left', 'lower', 'transpose', diag, m2, N, alpha, A, sa, sa * m1, offsetA + sa, B, sb1, sb2, offsetB + ( sb1 * m1 ) );
							dgemm( 'no-transpose', 'no-transpose', m1, N, m2, -1.0, A, sa, sa * m1, offsetA + ( sa * m1 * m1 ), B, sb1, sb2, offsetB + ( sb1 * m1 ), alpha, B, sb1, sb2, offsetB );
							dtrsm( 'left', 'upper', 'no-transpose', diag, m1, N, 1.0, A, sa, sa * m1, offsetA, B, sb1, sb2, offsetB );
						}
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='L', TRANSR='T', UPLO='U', TRANS='N'
						dtrsm( 'left', 'lower', 'transpose', diag, m2, N, alpha, A, sa, sa * m2, offsetA + ( sa * m1 * m2 ), B, sb1, sb2, offsetB + ( sb1 * m1 ) );
						dgemm( 'transpose', 'no-transpose', m1, N, m2, -1.0, A, sa, sa * m2, offsetA, B, sb1, sb2, offsetB + ( sb1 * m1 ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'left', 'upper', 'no-transpose', diag, m1, N, 1.0, A, sa, sa * m2, offsetA + ( sa * m2 * m2 ), B, sb1, sb2, offsetB );
					} else {
						// SIDE='L', TRANSR='T', UPLO='U', TRANS='T'
						dtrsm( 'left', 'upper', 'transpose', diag, m1, N, alpha, A, sa, sa * m2, offsetA + ( sa * m2 * m2 ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', m2, N, m1, -1.0, A, sa, sa * m2, offsetA, B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * m1 ) );
						dtrsm( 'left', 'lower', 'no-transpose', diag, m2, N, 1.0, A, sa, sa * m2, offsetA + ( sa * m1 * m2 ), B, sb1, sb2, offsetB + ( sb1 * m1 ) );
					}
				}
			}
		} else {
			// M is even
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = M+1
				if ( lower ) {
					if ( notrans ) {
						// SIDE='L', TRANSR='N', UPLO='L', TRANS='N', M even
						dtrsm( 'left', 'lower', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), offsetA + sa, B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * ( M + 1 ), offsetA + ( sa * ( k + 1 ) ), B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * k ) );
						dtrsm( 'left', 'upper', 'transpose', diag, k, N, 1.0, A, sa, sa * ( M + 1 ), offsetA, B, sb1, sb2, offsetB + ( sb1 * k ) );
					} else {
						// SIDE='L', TRANSR='N', UPLO='L', TRANS='T', M even
						dtrsm( 'left', 'upper', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), offsetA, B, sb1, sb2, offsetB + ( sb1 * k ) );
						dgemm( 'transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * ( M + 1 ), offsetA + ( sa * ( k + 1 ) ), B, sb1, sb2, offsetB + ( sb1 * k ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'left', 'lower', 'transpose', diag, k, N, 1.0, A, sa, sa * ( M + 1 ), offsetA + sa, B, sb1, sb2, offsetB );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='L', TRANSR='N', UPLO='U', TRANS='N', M even
						dtrsm( 'left', 'upper', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), offsetA + ( sa * k ), B, sb1, sb2, offsetB + ( sb1 * k ) );
						dgemm( 'no-transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * ( M + 1 ), offsetA, B, sb1, sb2, offsetB + ( sb1 * k ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'left', 'lower', 'transpose', diag, k, N, 1.0, A, sa, sa * ( M + 1 ), offsetA + ( sa * ( k + 1 ) ), B, sb1, sb2, offsetB );
					} else {
						// SIDE='L', TRANSR='N', UPLO='U', TRANS='T', M even
						dtrsm( 'left', 'lower', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), offsetA + ( sa * ( k + 1 ) ), B, sb1, sb2, offsetB );
						dgemm( 'transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * ( M + 1 ), offsetA, B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * k ) );
						dtrsm( 'left', 'upper', 'transpose', diag, k, N, 1.0, A, sa, sa * ( M + 1 ), offsetA + ( sa * k ), B, sb1, sb2, offsetB + ( sb1 * k ) );
					}
				}
			} else {
				// TRANSR = 'T', LDA = K
				if ( lower ) {
					if ( notrans ) {
						// SIDE='L', TRANSR='T', UPLO='L', TRANS='N', M even
						dtrsm( 'left', 'upper', 'transpose', diag, k, N, alpha, A, sa, sa * k, offsetA + ( sa * k ), B, sb1, sb2, offsetB );
						dgemm( 'transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * k, offsetA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * k ) );
						dtrsm( 'left', 'lower', 'no-transpose', diag, k, N, 1.0, A, sa, sa * k, offsetA, B, sb1, sb2, offsetB + ( sb1 * k ) );
					} else {
						// SIDE='L', TRANSR='T', UPLO='L', TRANS='T', M even
						dtrsm( 'left', 'lower', 'transpose', diag, k, N, alpha, A, sa, sa * k, offsetA, B, sb1, sb2, offsetB + ( sb1 * k ) );
						dgemm( 'no-transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * k, offsetA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, offsetB + ( sb1 * k ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'left', 'upper', 'no-transpose', diag, k, N, 1.0, A, sa, sa * k, offsetA + ( sa * k ), B, sb1, sb2, offsetB );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='L', TRANSR='T', UPLO='U', TRANS='N', M even
						dtrsm( 'left', 'lower', 'transpose', diag, k, N, alpha, A, sa, sa * k, offsetA + ( sa * k * k ), B, sb1, sb2, offsetB + ( sb1 * k ) );
						dgemm( 'transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * k, offsetA, B, sb1, sb2, offsetB + ( sb1 * k ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'left', 'upper', 'no-transpose', diag, k, N, 1.0, A, sa, sa * k, offsetA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, offsetB );
					} else {
						// SIDE='L', TRANSR='T', UPLO='U', TRANS='T', M even
						dtrsm( 'left', 'upper', 'transpose', diag, k, N, alpha, A, sa, sa * k, offsetA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', k, N, k, -1.0, A, sa, sa * k, offsetA, B, sb1, sb2, offsetB, alpha, B, sb1, sb2, offsetB + ( sb1 * k ) );
						dtrsm( 'left', 'lower', 'no-transpose', diag, k, N, 1.0, A, sa, sa * k, offsetA + ( sa * k * k ), B, sb1, sb2, offsetB + ( sb1 * k ) );
					}
				}
			}
		}
	} else {
		// SIDE = 'R': X * op(A) = alpha * B, A is N x N

		if ( N % 2 === 0 ) {
			nisodd = false;
			k = N / 2;
		} else {
			nisodd = true;
			if ( lower ) {
				n2 = Math.floor( N / 2 );
				n1 = N - n2;
			} else {
				n1 = Math.floor( N / 2 );
				n2 = N - n1;
			}
		}

		if ( nisodd ) {
			// N is odd
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = N
				if ( lower ) {
					if ( notrans ) {
						// SIDE='R', TRANSR='N', UPLO='L', TRANS='N'
						dtrsm( 'right', 'upper', 'transpose', diag, M, n2, alpha, A, sa, sa * N, offsetA + ( sa * N ), B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dgemm( 'no-transpose', 'no-transpose', M, n1, n2, -1.0, B, sb1, sb2, offsetB + ( sb2 * n1 ), A, sa, sa * N, offsetA + ( sa * n1 ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, n1, 1.0, A, sa, sa * N, offsetA, B, sb1, sb2, offsetB );
					} else {
						// SIDE='R', TRANSR='N', UPLO='L', TRANS='T'
						dtrsm( 'right', 'lower', 'transpose', diag, M, n1, alpha, A, sa, sa * N, offsetA, B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'transpose', M, n2, n1, -1.0, B, sb1, sb2, offsetB, A, sa, sa * N, offsetA + ( sa * n1 ), alpha, B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, n2, 1.0, A, sa, sa * N, offsetA + ( sa * N ), B, sb1, sb2, offsetB + ( sb2 * n1 ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='R', TRANSR='N', UPLO='U', TRANS='N'
						dtrsm( 'right', 'lower', 'transpose', diag, M, n1, alpha, A, sa, sa * N, offsetA + ( sa * n2 ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', M, n2, n1, -1.0, B, sb1, sb2, offsetB, A, sa, sa * N, offsetA, alpha, B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, n2, 1.0, A, sa, sa * N, offsetA + ( sa * n1 ), B, sb1, sb2, offsetB + ( sb2 * n1 ) );
					} else {
						// SIDE='R', TRANSR='N', UPLO='U', TRANS='T'
						dtrsm( 'right', 'upper', 'transpose', diag, M, n2, alpha, A, sa, sa * N, offsetA + ( sa * n1 ), B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dgemm( 'no-transpose', 'transpose', M, n1, n2, -1.0, B, sb1, sb2, offsetB + ( sb2 * n1 ), A, sa, sa * N, offsetA, alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, n1, 1.0, A, sa, sa * N, offsetA + ( sa * n2 ), B, sb1, sb2, offsetB );
					}
				}
			} else {
				// TRANSR = 'T', LDA = N1
				if ( lower ) {
					if ( notrans ) {
						// SIDE='R', TRANSR='T', UPLO='L', TRANS='N'
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, n2, alpha, A, sa, sa * n1, offsetA + sa, B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dgemm( 'no-transpose', 'transpose', M, n1, n2, -1.0, B, sb1, sb2, offsetB + ( sb2 * n1 ), A, sa, sa * n1, offsetA + ( sa * n1 * n1 ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'upper', 'transpose', diag, M, n1, 1.0, A, sa, sa * n1, offsetA, B, sb1, sb2, offsetB );
					} else {
						// SIDE='R', TRANSR='T', UPLO='L', TRANS='T'
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, n1, alpha, A, sa, sa * n1, offsetA, B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', M, n2, n1, -1.0, B, sb1, sb2, offsetB, A, sa, sa * n1, offsetA + ( sa * n1 * n1 ), alpha, B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dtrsm( 'right', 'lower', 'transpose', diag, M, n2, 1.0, A, sa, sa * n1, offsetA + sa, B, sb1, sb2, offsetB + ( sb2 * n1 ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='R', TRANSR='T', UPLO='U', TRANS='N'
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, n1, alpha, A, sa, sa * n2, offsetA + ( sa * n2 * n2 ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'transpose', M, n2, n1, -1.0, B, sb1, sb2, offsetB, A, sa, sa * n2, offsetA, alpha, B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dtrsm( 'right', 'lower', 'transpose', diag, M, n2, 1.0, A, sa, sa * n2, offsetA + ( sa * n1 * n2 ), B, sb1, sb2, offsetB + ( sb2 * n1 ) );
					} else {
						// SIDE='R', TRANSR='T', UPLO='U', TRANS='T'
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, n2, alpha, A, sa, sa * n2, offsetA + ( sa * n1 * n2 ), B, sb1, sb2, offsetB + ( sb2 * n1 ) );
						dgemm( 'no-transpose', 'no-transpose', M, n1, n2, -1.0, B, sb1, sb2, offsetB + ( sb2 * n1 ), A, sa, sa * n2, offsetA, alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'upper', 'transpose', diag, M, n1, 1.0, A, sa, sa * n2, offsetA + ( sa * n2 * n2 ), B, sb1, sb2, offsetB );
					}
				}
			}
		} else {
			// N is even
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = N+1
				if ( lower ) {
					if ( notrans ) {
						// SIDE='R', TRANSR='N', UPLO='L', TRANS='N', N even
						dtrsm( 'right', 'upper', 'transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), offsetA, B, sb1, sb2, offsetB + ( sb2 * k ) );
						dgemm( 'no-transpose', 'no-transpose', M, k, k, -1.0, B, sb1, sb2, offsetB + ( sb2 * k ), A, sa, sa * ( N + 1 ), offsetA + ( sa * ( k + 1 ) ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, k, 1.0, A, sa, sa * ( N + 1 ), offsetA + sa, B, sb1, sb2, offsetB );
					} else {
						// SIDE='R', TRANSR='N', UPLO='L', TRANS='T', N even
						dtrsm( 'right', 'lower', 'transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), offsetA + sa, B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'transpose', M, k, k, -1.0, B, sb1, sb2, offsetB, A, sa, sa * ( N + 1 ), offsetA + ( sa * ( k + 1 ) ), alpha, B, sb1, sb2, offsetB + ( sb2 * k ) );
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, k, 1.0, A, sa, sa * ( N + 1 ), offsetA, B, sb1, sb2, offsetB + ( sb2 * k ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='R', TRANSR='N', UPLO='U', TRANS='N', N even
						dtrsm( 'right', 'lower', 'transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), offsetA + ( sa * ( k + 1 ) ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', M, k, k, -1.0, B, sb1, sb2, offsetB, A, sa, sa * ( N + 1 ), offsetA, alpha, B, sb1, sb2, offsetB + ( sb2 * k ) );
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, k, 1.0, A, sa, sa * ( N + 1 ), offsetA + ( sa * k ), B, sb1, sb2, offsetB + ( sb2 * k ) );
					} else {
						// SIDE='R', TRANSR='N', UPLO='U', TRANS='T', N even
						dtrsm( 'right', 'upper', 'transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), offsetA + ( sa * k ), B, sb1, sb2, offsetB + ( sb2 * k ) );
						dgemm( 'no-transpose', 'transpose', M, k, k, -1.0, B, sb1, sb2, offsetB + ( sb2 * k ), A, sa, sa * ( N + 1 ), offsetA, alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, k, 1.0, A, sa, sa * ( N + 1 ), offsetA + ( sa * ( k + 1 ) ), B, sb1, sb2, offsetB );
					}
				}
			} else {
				// TRANSR = 'T', LDA = K
				if ( lower ) {
					if ( notrans ) {
						// SIDE='R', TRANSR='T', UPLO='L', TRANS='N', N even
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, offsetA, B, sb1, sb2, offsetB + ( sb2 * k ) );
						dgemm( 'no-transpose', 'transpose', M, k, k, -1.0, B, sb1, sb2, offsetB + ( sb2 * k ), A, sa, sa * k, offsetA + ( sa * ( k + 1 ) * k ), alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'upper', 'transpose', diag, M, k, 1.0, A, sa, sa * k, offsetA + ( sa * k ), B, sb1, sb2, offsetB );
					} else {
						// SIDE='R', TRANSR='T', UPLO='L', TRANS='T', N even
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, offsetA + ( sa * k ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'no-transpose', M, k, k, -1.0, B, sb1, sb2, offsetB, A, sa, sa * k, offsetA + ( sa * ( k + 1 ) * k ), alpha, B, sb1, sb2, offsetB + ( sb2 * k ) );
						dtrsm( 'right', 'lower', 'transpose', diag, M, k, 1.0, A, sa, sa * k, offsetA, B, sb1, sb2, offsetB + ( sb2 * k ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// SIDE='R', TRANSR='T', UPLO='U', TRANS='N', N even
						dtrsm( 'right', 'upper', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, offsetA + ( sa * ( k + 1 ) * k ), B, sb1, sb2, offsetB );
						dgemm( 'no-transpose', 'transpose', M, k, k, -1.0, B, sb1, sb2, offsetB, A, sa, sa * k, offsetA, alpha, B, sb1, sb2, offsetB + ( sb2 * k ) );
						dtrsm( 'right', 'lower', 'transpose', diag, M, k, 1.0, A, sa, sa * k, offsetA + ( sa * k * k ), B, sb1, sb2, offsetB + ( sb2 * k ) );
					} else {
						// SIDE='R', TRANSR='T', UPLO='U', TRANS='T', N even
						dtrsm( 'right', 'lower', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, offsetA + ( sa * k * k ), B, sb1, sb2, offsetB + ( sb2 * k ) );
						dgemm( 'no-transpose', 'no-transpose', M, k, k, -1.0, B, sb1, sb2, offsetB + ( sb2 * k ), A, sa, sa * k, offsetA, alpha, B, sb1, sb2, offsetB );
						dtrsm( 'right', 'upper', 'transpose', diag, M, k, 1.0, A, sa, sa * k, offsetA + ( sa * ( k + 1 ) * k ), B, sb1, sb2, offsetB );
					}
				}
			}
		}
	}
}


// EXPORTS //

export default dtfsm;
