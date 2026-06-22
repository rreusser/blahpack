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

/* eslint-disable max-len, max-lines-per-function, max-params, max-statements, max-depth, no-lonely-if */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var NCONE = new Complex128( -1.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Solves a matrix equation with a complex triangular matrix stored in Rectangular Full Packed (RFP) format.
*
* ZTFSM solves the matrix equation
*
* ```tex
* op(A) \cdot X = \alpha \cdot B \quad \text{or} \quad X \cdot op(A) = \alpha \cdot B
* ```
*
* where alpha is a scalar, X and B are M-by-N matrices, A is a unit or
* non-unit, upper or lower triangular matrix, and `op(A)` is one of
* `op(A) = A` or `op(A) = A**H`.
*
* A is in Rectangular Full Packed (RFP) format.
* The matrix X is overwritten on B.
*
* @private
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'` specifying the RFP storage form
* @param {string} side - `'left'` or `'right'` specifying whether op(A) appears on the left or right
* @param {string} uplo - `'upper'` or `'lower'` specifying whether A is upper or lower triangular
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'` specifying op(A)
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - RFP array of length nt*(nt+1)/2 where nt=M (side=left) or nt=N (side=right)
* @param {integer} strideA - stride for `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - M-by-N complex matrix (overwritten with X on exit)
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {Complex128Array} `B`
*/
function ztfsm( transr, side, uplo, trans, diag, M, N, alpha, A, strideA, offsetA, B, strideB1, strideB2, offsetB ) {
	var normalTransr;
	var notrans;
	var misodd;
	var nisodd;
	var alphaR;
	var alphaI;
	var lside;
	var lower;
	var sb1;
	var sb2;
	var Bv;
	var oA;
	var oB;
	var m1;
	var m2;
	var n1;
	var n2;
	var sa;
	var ib;
	var k;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return B;
	}

	normalTransr = ( transr === 'no-transpose' );
	lside = ( side === 'left' );
	lower = ( uplo === 'lower' );
	notrans = ( trans === 'no-transpose' );

	alphaR = real( alpha );
	alphaI = imag( alpha );

	sa = strideA;
	sb1 = strideB1;
	sb2 = strideB2;
	oA = offsetA;
	oB = offsetB;

	// Quick return: alpha is zero => set B to zero
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		Bv = reinterpret( B, 0 );
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				ib = 2 * ( oB + ( i * sb1 ) + ( j * sb2 ) );
				Bv[ ib ] = 0.0;
				Bv[ ib + 1 ] = 0.0;
			}
		}
		return B;
	}

	if ( lside ) {
		// SIDE = 'L': op(A)*X = alpha*B, A is M-by-M

		if ( M % 2 === 0 ) {
			misodd = false;
			k = M / 2;
		} else {
			misodd = true;
			if ( lower ) {
				m2 = ( M / 2 ) | 0;
				m1 = M - m2;
			} else {
				m1 = ( M / 2 ) | 0;
				m2 = M - m1;
			}
		}

		if ( misodd ) {
			// M is odd
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = M
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						if ( M === 1 ) {
							ztrsm( 'left', 'lower', 'no-transpose', diag, m1, N, alpha, A, sa, sa * M, oA, B, sb1, sb2, oB );
						} else {
							ztrsm( 'left', 'lower', 'no-transpose', diag, m1, N, alpha, A, sa, sa * M, oA, B, sb1, sb2, oB );
							zgemm( 'no-transpose', 'no-transpose', m2, N, m1, NCONE, A, sa, sa * M, oA + ( sa * m1 ), B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * m1 ) );
							ztrsm( 'left', 'upper', 'conjugate-transpose', diag, m2, N, CONE, A, sa, sa * M, oA + ( sa * M ), B, sb1, sb2, oB + ( sb1 * m1 ) );
						}
					} else {
						// TRANS = 'C'
						if ( M === 1 ) {
							ztrsm( 'left', 'lower', 'conjugate-transpose', diag, m1, N, alpha, A, sa, sa * M, oA, B, sb1, sb2, oB );
						} else {
							ztrsm( 'left', 'upper', 'no-transpose', diag, m2, N, alpha, A, sa, sa * M, oA + ( sa * M ), B, sb1, sb2, oB + ( sb1 * m1 ) );
							zgemm( 'conjugate-transpose', 'no-transpose', m1, N, m2, NCONE, A, sa, sa * M, oA + ( sa * m1 ), B, sb1, sb2, oB + ( sb1 * m1 ), alpha, B, sb1, sb2, oB );
							ztrsm( 'left', 'lower', 'conjugate-transpose', diag, m1, N, CONE, A, sa, sa * M, oA, B, sb1, sb2, oB );
						}
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'left', 'upper', 'no-transpose', diag, m2, N, alpha, A, sa, sa * M, oA + ( sa * m1 ), B, sb1, sb2, oB + ( sb1 * m1 ) );
						zgemm( 'no-transpose', 'no-transpose', m1, N, m2, NCONE, A, sa, sa * M, oA, B, sb1, sb2, oB + ( sb1 * m1 ), alpha, B, sb1, sb2, oB );
						ztrsm( 'left', 'lower', 'conjugate-transpose', diag, m1, N, CONE, A, sa, sa * M, oA + ( sa * m2 ), B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'left', 'lower', 'no-transpose', diag, m1, N, alpha, A, sa, sa * M, oA + ( sa * m2 ), B, sb1, sb2, oB );
						zgemm( 'conjugate-transpose', 'no-transpose', m2, N, m1, NCONE, A, sa, sa * M, oA, B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * m1 ) );
						ztrsm( 'left', 'upper', 'conjugate-transpose', diag, m2, N, CONE, A, sa, sa * M, oA + ( sa * m1 ), B, sb1, sb2, oB + ( sb1 * m1 ) );
					}
				}
			} else {
				// TRANSR = 'C', LDA for sub-blocks varies
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						if ( M === 1 ) {
							ztrsm( 'left', 'upper', 'conjugate-transpose', diag, m1, N, alpha, A, sa, sa * m1, oA, B, sb1, sb2, oB );
						} else {
							ztrsm( 'left', 'upper', 'conjugate-transpose', diag, m1, N, alpha, A, sa, sa * m1, oA, B, sb1, sb2, oB );
							zgemm( 'conjugate-transpose', 'no-transpose', m2, N, m1, NCONE, A, sa, sa * m1, oA + ( sa * m1 * m1 ), B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * m1 ) );
							ztrsm( 'left', 'lower', 'no-transpose', diag, m2, N, CONE, A, sa, sa * m1, oA + sa, B, sb1, sb2, oB + ( sb1 * m1 ) );
						}
					} else {
						// TRANS = 'C'
						if ( M === 1 ) {
							ztrsm( 'left', 'upper', 'no-transpose', diag, m1, N, alpha, A, sa, sa * m1, oA, B, sb1, sb2, oB );
						} else {
							ztrsm( 'left', 'lower', 'conjugate-transpose', diag, m2, N, alpha, A, sa, sa * m1, oA + sa, B, sb1, sb2, oB + ( sb1 * m1 ) );
							zgemm( 'no-transpose', 'no-transpose', m1, N, m2, NCONE, A, sa, sa * m1, oA + ( sa * m1 * m1 ), B, sb1, sb2, oB + ( sb1 * m1 ), alpha, B, sb1, sb2, oB );
							ztrsm( 'left', 'upper', 'no-transpose', diag, m1, N, CONE, A, sa, sa * m1, oA, B, sb1, sb2, oB );
						}
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'left', 'lower', 'conjugate-transpose', diag, m2, N, alpha, A, sa, sa * m2, oA + ( sa * m1 * m2 ), B, sb1, sb2, oB + ( sb1 * m1 ) );
						zgemm( 'conjugate-transpose', 'no-transpose', m1, N, m2, NCONE, A, sa, sa * m2, oA, B, sb1, sb2, oB + ( sb1 * m1 ), alpha, B, sb1, sb2, oB );
						ztrsm( 'left', 'upper', 'no-transpose', diag, m1, N, CONE, A, sa, sa * m2, oA + ( sa * m2 * m2 ), B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'left', 'upper', 'conjugate-transpose', diag, m1, N, alpha, A, sa, sa * m2, oA + ( sa * m2 * m2 ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', m2, N, m1, NCONE, A, sa, sa * m2, oA, B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * m1 ) );
						ztrsm( 'left', 'lower', 'no-transpose', diag, m2, N, CONE, A, sa, sa * m2, oA + ( sa * m1 * m2 ), B, sb1, sb2, oB + ( sb1 * m1 ) );
					}
				}
			}
		} else {
			// M is even
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = M+1
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'left', 'lower', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), oA + sa, B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * ( M + 1 ), oA + ( sa * ( k + 1 ) ), B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * k ) );
						ztrsm( 'left', 'upper', 'conjugate-transpose', diag, k, N, CONE, A, sa, sa * ( M + 1 ), oA, B, sb1, sb2, oB + ( sb1 * k ) );
					} else {
						// TRANS = 'C'
						ztrsm( 'left', 'upper', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), oA, B, sb1, sb2, oB + ( sb1 * k ) );
						zgemm( 'conjugate-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * ( M + 1 ), oA + ( sa * ( k + 1 ) ), B, sb1, sb2, oB + ( sb1 * k ), alpha, B, sb1, sb2, oB );
						ztrsm( 'left', 'lower', 'conjugate-transpose', diag, k, N, CONE, A, sa, sa * ( M + 1 ), oA + sa, B, sb1, sb2, oB );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'left', 'upper', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), oA + ( sa * k ), B, sb1, sb2, oB + ( sb1 * k ) );
						zgemm( 'no-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * ( M + 1 ), oA, B, sb1, sb2, oB + ( sb1 * k ), alpha, B, sb1, sb2, oB );
						ztrsm( 'left', 'lower', 'conjugate-transpose', diag, k, N, CONE, A, sa, sa * ( M + 1 ), oA + ( sa * ( k + 1 ) ), B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'left', 'lower', 'no-transpose', diag, k, N, alpha, A, sa, sa * ( M + 1 ), oA + ( sa * ( k + 1 ) ), B, sb1, sb2, oB );
						zgemm( 'conjugate-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * ( M + 1 ), oA, B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * k ) );
						ztrsm( 'left', 'upper', 'conjugate-transpose', diag, k, N, CONE, A, sa, sa * ( M + 1 ), oA + ( sa * k ), B, sb1, sb2, oB + ( sb1 * k ) );
					}
				}
			} else {
				// TRANSR = 'C', LDA = K = M/2
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'left', 'upper', 'conjugate-transpose', diag, k, N, alpha, A, sa, sa * k, oA + ( sa * k ), B, sb1, sb2, oB );
						zgemm( 'conjugate-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * k, oA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * k ) );
						ztrsm( 'left', 'lower', 'no-transpose', diag, k, N, CONE, A, sa, sa * k, oA, B, sb1, sb2, oB + ( sb1 * k ) );
					} else {
						// TRANS = 'C'
						ztrsm( 'left', 'lower', 'conjugate-transpose', diag, k, N, alpha, A, sa, sa * k, oA, B, sb1, sb2, oB + ( sb1 * k ) );
						zgemm( 'no-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * k, oA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, oB + ( sb1 * k ), alpha, B, sb1, sb2, oB );
						ztrsm( 'left', 'upper', 'no-transpose', diag, k, N, CONE, A, sa, sa * k, oA + ( sa * k ), B, sb1, sb2, oB );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'left', 'lower', 'conjugate-transpose', diag, k, N, alpha, A, sa, sa * k, oA + ( sa * k * k ), B, sb1, sb2, oB + ( sb1 * k ) );
						zgemm( 'conjugate-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * k, oA, B, sb1, sb2, oB + ( sb1 * k ), alpha, B, sb1, sb2, oB );
						ztrsm( 'left', 'upper', 'no-transpose', diag, k, N, CONE, A, sa, sa * k, oA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'left', 'upper', 'conjugate-transpose', diag, k, N, alpha, A, sa, sa * k, oA + ( sa * k * ( k + 1 ) ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', k, N, k, NCONE, A, sa, sa * k, oA, B, sb1, sb2, oB, alpha, B, sb1, sb2, oB + ( sb1 * k ) );
						ztrsm( 'left', 'lower', 'no-transpose', diag, k, N, CONE, A, sa, sa * k, oA + ( sa * k * k ), B, sb1, sb2, oB + ( sb1 * k ) );
					}
				}
			}
		}
	} else {
		// SIDE = 'R': X*op(A) = alpha*B, A is N-by-N

		if ( N % 2 === 0 ) {
			nisodd = false;
			k = N / 2;
		} else {
			nisodd = true;
			if ( lower ) {
				n2 = ( N / 2 ) | 0;
				n1 = N - n2;
			} else {
				n1 = ( N / 2 ) | 0;
				n2 = N - n1;
			}
		}

		if ( nisodd ) {
			// N is odd
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = N
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, n2, alpha, A, sa, sa * N, oA + ( sa * N ), B, sb1, sb2, oB + ( sb2 * n1 ) );
						zgemm( 'no-transpose', 'no-transpose', M, n1, n2, NCONE, B, sb1, sb2, oB + ( sb2 * n1 ), A, sa, sa * N, oA + ( sa * n1 ), alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, n1, CONE, A, sa, sa * N, oA, B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, n1, alpha, A, sa, sa * N, oA, B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'conjugate-transpose', M, n2, n1, NCONE, B, sb1, sb2, oB, A, sa, sa * N, oA + ( sa * n1 ), alpha, B, sb1, sb2, oB + ( sb2 * n1 ) );
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, n2, CONE, A, sa, sa * N, oA + ( sa * N ), B, sb1, sb2, oB + ( sb2 * n1 ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, n1, alpha, A, sa, sa * N, oA + ( sa * n2 ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', M, n2, n1, NCONE, B, sb1, sb2, oB, A, sa, sa * N, oA, alpha, B, sb1, sb2, oB + ( sb2 * n1 ) );
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, n2, CONE, A, sa, sa * N, oA + ( sa * n1 ), B, sb1, sb2, oB + ( sb2 * n1 ) );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, n2, alpha, A, sa, sa * N, oA + ( sa * n1 ), B, sb1, sb2, oB + ( sb2 * n1 ) );
						zgemm( 'no-transpose', 'conjugate-transpose', M, n1, n2, NCONE, B, sb1, sb2, oB + ( sb2 * n1 ), A, sa, sa * N, oA, alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, n1, CONE, A, sa, sa * N, oA + ( sa * n2 ), B, sb1, sb2, oB );
					}
				}
			} else {
				// TRANSR = 'C', LDA varies
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, n2, alpha, A, sa, sa * n1, oA + sa, B, sb1, sb2, oB + ( sb2 * n1 ) );
						zgemm( 'no-transpose', 'conjugate-transpose', M, n1, n2, NCONE, B, sb1, sb2, oB + ( sb2 * n1 ), A, sa, sa * n1, oA + ( sa * n1 * n1 ), alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, n1, CONE, A, sa, sa * n1, oA, B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, n1, alpha, A, sa, sa * n1, oA, B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', M, n2, n1, NCONE, B, sb1, sb2, oB, A, sa, sa * n1, oA + ( sa * n1 * n1 ), alpha, B, sb1, sb2, oB + ( sb2 * n1 ) );
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, n2, CONE, A, sa, sa * n1, oA + sa, B, sb1, sb2, oB + ( sb2 * n1 ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, n1, alpha, A, sa, sa * n2, oA + ( sa * n2 * n2 ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'conjugate-transpose', M, n2, n1, NCONE, B, sb1, sb2, oB, A, sa, sa * n2, oA, alpha, B, sb1, sb2, oB + ( sb2 * n1 ) );
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, n2, CONE, A, sa, sa * n2, oA + ( sa * n1 * n2 ), B, sb1, sb2, oB + ( sb2 * n1 ) );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, n2, alpha, A, sa, sa * n2, oA + ( sa * n1 * n2 ), B, sb1, sb2, oB + ( sb2 * n1 ) );
						zgemm( 'no-transpose', 'no-transpose', M, n1, n2, NCONE, B, sb1, sb2, oB + ( sb2 * n1 ), A, sa, sa * n2, oA, alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, n1, CONE, A, sa, sa * n2, oA + ( sa * n2 * n2 ), B, sb1, sb2, oB );
					}
				}
			}
		} else {
			// N is even
			if ( normalTransr ) {
				// TRANSR = 'N', LDA = N+1
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), oA, B, sb1, sb2, oB + ( sb2 * k ) );
						zgemm( 'no-transpose', 'no-transpose', M, k, k, NCONE, B, sb1, sb2, oB + ( sb2 * k ), A, sa, sa * ( N + 1 ), oA + ( sa * ( k + 1 ) ), alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, k, CONE, A, sa, sa * ( N + 1 ), oA + sa, B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), oA + sa, B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'conjugate-transpose', M, k, k, NCONE, B, sb1, sb2, oB, A, sa, sa * ( N + 1 ), oA + ( sa * ( k + 1 ) ), alpha, B, sb1, sb2, oB + ( sb2 * k ) );
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, k, CONE, A, sa, sa * ( N + 1 ), oA, B, sb1, sb2, oB + ( sb2 * k ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), oA + ( sa * ( k + 1 ) ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', M, k, k, NCONE, B, sb1, sb2, oB, A, sa, sa * ( N + 1 ), oA, alpha, B, sb1, sb2, oB + ( sb2 * k ) );
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, k, CONE, A, sa, sa * ( N + 1 ), oA + ( sa * k ), B, sb1, sb2, oB + ( sb2 * k ) );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, k, alpha, A, sa, sa * ( N + 1 ), oA + ( sa * k ), B, sb1, sb2, oB + ( sb2 * k ) );
						zgemm( 'no-transpose', 'conjugate-transpose', M, k, k, NCONE, B, sb1, sb2, oB + ( sb2 * k ), A, sa, sa * ( N + 1 ), oA, alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, k, CONE, A, sa, sa * ( N + 1 ), oA + ( sa * ( k + 1 ) ), B, sb1, sb2, oB );
					}
				}
			} else {
				// TRANSR = 'C', LDA = K = N/2
				if ( lower ) {
					// UPLO = 'L'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, oA, B, sb1, sb2, oB + ( sb2 * k ) );
						zgemm( 'no-transpose', 'conjugate-transpose', M, k, k, NCONE, B, sb1, sb2, oB + ( sb2 * k ), A, sa, sa * k, oA + ( sa * ( k + 1 ) * k ), alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, k, CONE, A, sa, sa * k, oA + ( sa * k ), B, sb1, sb2, oB );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, oA + ( sa * k ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'no-transpose', M, k, k, NCONE, B, sb1, sb2, oB, A, sa, sa * k, oA + ( sa * ( k + 1 ) * k ), alpha, B, sb1, sb2, oB + ( sb2 * k ) );
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, k, CONE, A, sa, sa * k, oA, B, sb1, sb2, oB + ( sb2 * k ) );
					}
				} else {
					// UPLO = 'U'
					if ( notrans ) {
						// TRANS = 'N'
						ztrsm( 'right', 'upper', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, oA + ( sa * ( k + 1 ) * k ), B, sb1, sb2, oB );
						zgemm( 'no-transpose', 'conjugate-transpose', M, k, k, NCONE, B, sb1, sb2, oB, A, sa, sa * k, oA, alpha, B, sb1, sb2, oB + ( sb2 * k ) );
						ztrsm( 'right', 'lower', 'conjugate-transpose', diag, M, k, CONE, A, sa, sa * k, oA + ( sa * k * k ), B, sb1, sb2, oB + ( sb2 * k ) );
					} else {
						// TRANS = 'C'
						ztrsm( 'right', 'lower', 'no-transpose', diag, M, k, alpha, A, sa, sa * k, oA + ( sa * k * k ), B, sb1, sb2, oB + ( sb2 * k ) );
						zgemm( 'no-transpose', 'no-transpose', M, k, k, NCONE, B, sb1, sb2, oB + ( sb2 * k ), A, sa, sa * k, oA, alpha, B, sb1, sb2, oB );
						ztrsm( 'right', 'upper', 'conjugate-transpose', diag, M, k, CONE, A, sa, sa * k, oA + ( sa * ( k + 1 ) * k ), B, sb1, sb2, oB );
					}
				}
			}
		}
	}

	return B;
}


// EXPORTS //

export default ztfsm;
