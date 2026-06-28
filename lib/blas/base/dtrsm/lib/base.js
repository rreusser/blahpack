/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-depth, max-len, max-lines-per-function, max-params, max-statements */

// MAIN //

/**
* Solves one of the matrix equations:.
* op(A)_X = alpha_B,  or  X_op(A) = alpha_B
* where alpha is a scalar, X and B are M-by-N matrices, A is a unit or
* non-unit, upper or lower triangular matrix, and op(A) is A or A**T.
* The matrix X is overwritten on B.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'` (upper or lower triangular)
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier for B
* @param {Float64Array} A - triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - input/output matrix (overwritten with X)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {Float64Array} `B`
*/
function dtrsm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var nounit;
	var lside;
	var upper;
	var temp;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ia;
	var ib;
	var i;
	var j;
	var k;

	lside = ( side === 'left' );
	nounit = ( diag === 'non-unit' );
	upper = ( uplo === 'upper' );

	if ( M === 0 || N === 0 ) {
		return B;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	// When alpha is zero, set B to zero
	if ( alpha === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			ib = offsetB + (j * sb2);
			for ( i = 0; i < M; i++ ) {
				B[ ib ] = 0.0;
				ib += sb1;
			}
		}
		return B;
	}

	if ( lside ) {
		if ( transa === 'no-transpose' ) {
			// Solve A*X = alpha*B
			if ( upper ) {
				// Left, Upper, No-transpose
				for ( j = 0; j < N; j++ ) {
					if ( alpha !== 1.0 ) {
						ib = offsetB + (j * sb2);
						for ( i = 0; i < M; i++ ) {
							B[ ib ] *= alpha;
							ib += sb1;
						}
					}
					for ( k = M - 1; k >= 0; k-- ) {
						ib = offsetB + (k * sb1) + (j * sb2);
						if ( B[ ib ] !== 0.0 ) {
							if ( nounit ) {
								B[ ib ] /= A[ offsetA + (k * sa1) + (k * sa2) ];
							}
							ia = offsetA + (k * sa2);
							for ( i = 0; i < k; i++ ) {
								B[ offsetB + (i * sb1) + (j * sb2) ] -= B[ ib ] * A[ ia ];
								ia += sa1;
							}
						}
					}
				}
			} else {
				// Left, Lower, No-transpose
				for ( j = 0; j < N; j++ ) {
					if ( alpha !== 1.0 ) {
						ib = offsetB + (j * sb2);
						for ( i = 0; i < M; i++ ) {
							B[ ib ] *= alpha;
							ib += sb1;
						}
					}
					for ( k = 0; k < M; k++ ) {
						ib = offsetB + (k * sb1) + (j * sb2);
						if ( B[ ib ] !== 0.0 ) {
							if ( nounit ) {
								B[ ib ] /= A[ offsetA + (k * sa1) + (k * sa2) ];
							}
							for ( i = k + 1; i < M; i++ ) {
								B[ offsetB + (i * sb1) + (j * sb2) ] -= B[ ib ] * A[ offsetA + (i * sa1) + (k * sa2) ];
							}
						}
					}
				}
			}
		} else if ( upper ) {
			// Solve A^T*X = alpha*B, Left, Upper, Transpose
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					temp = alpha * B[ offsetB + (i * sb1) + (j * sb2) ];
					ia = offsetA + (i * sa2);
					for ( k = 0; k < i; k++ ) {
						temp -= A[ ia ] * B[ offsetB + (k * sb1) + (j * sb2) ];
						ia += sa1;
					}
					if ( nounit ) {
						temp /= A[ offsetA + (i * sa1) + (i * sa2) ];
					}
					B[ offsetB + (i * sb1) + (j * sb2) ] = temp;
				}
			}
		} else {
			// Solve A^T*X = alpha*B, Left, Lower, Transpose
			for ( j = 0; j < N; j++ ) {
				for ( i = M - 1; i >= 0; i-- ) {
					temp = alpha * B[ offsetB + (i * sb1) + (j * sb2) ];
					for ( k = i + 1; k < M; k++ ) {
						temp -= A[ offsetA + (k * sa1) + (i * sa2) ] * B[ offsetB + (k * sb1) + (j * sb2) ];
					}
					if ( nounit ) {
						temp /= A[ offsetA + (i * sa1) + (i * sa2) ];
					}
					B[ offsetB + (i * sb1) + (j * sb2) ] = temp;
				}
			}
		}
	} else if ( transa === 'no-transpose' ) {
		// Solve X*A = alpha*B
		if ( upper ) {
			// Right, Upper, No-transpose
			for ( j = 0; j < N; j++ ) {
				if ( alpha !== 1.0 ) {
					ib = offsetB + (j * sb2);
					for ( i = 0; i < M; i++ ) {
						B[ ib ] *= alpha;
						ib += sb1;
					}
				}
				for ( k = 0; k < j; k++ ) {
					if ( A[ offsetA + (k * sa1) + (j * sa2) ] !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							B[ offsetB + (i * sb1) + (j * sb2) ] -= A[ offsetA + (k * sa1) + (j * sa2) ] * B[ offsetB + (i * sb1) + (k * sb2) ];
						}
					}
				}
				if ( nounit ) {
					temp = 1.0 / A[ offsetA + (j * sa1) + (j * sa2) ];
					ib = offsetB + (j * sb2);
					for ( i = 0; i < M; i++ ) {
						B[ ib ] *= temp;
						ib += sb1;
					}
				}
			}
		} else {
			// Right, Lower, No-transpose
			for ( j = N - 1; j >= 0; j-- ) {
				if ( alpha !== 1.0 ) {
					ib = offsetB + (j * sb2);
					for ( i = 0; i < M; i++ ) {
						B[ ib ] *= alpha;
						ib += sb1;
					}
				}
				for ( k = j + 1; k < N; k++ ) {
					if ( A[ offsetA + (k * sa1) + (j * sa2) ] !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							B[ offsetB + (i * sb1) + (j * sb2) ] -= A[ offsetA + (k * sa1) + (j * sa2) ] * B[ offsetB + (i * sb1) + (k * sb2) ];
						}
					}
				}
				if ( nounit ) {
					temp = 1.0 / A[ offsetA + (j * sa1) + (j * sa2) ];
					ib = offsetB + (j * sb2);
					for ( i = 0; i < M; i++ ) {
						B[ ib ] *= temp;
						ib += sb1;
					}
				}
			}
		}
	} else if ( upper ) {
		// Solve X*A^T = alpha*B, Right, Upper, Transpose
		for ( k = N - 1; k >= 0; k-- ) {
			if ( nounit ) {
				temp = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
				ib = offsetB + (k * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= temp;
					ib += sb1;
				}
			}
			for ( j = 0; j < k; j++ ) {
				if ( A[ offsetA + (j * sa1) + (k * sa2) ] !== 0.0 ) {
					temp = A[ offsetA + (j * sa1) + (k * sa2) ];
					for ( i = 0; i < M; i++ ) {
						B[ offsetB + (i * sb1) + (j * sb2) ] -= temp * B[ offsetB + (i * sb1) + (k * sb2) ];
					}
				}
			}
			if ( alpha !== 1.0 ) {
				ib = offsetB + (k * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= alpha;
					ib += sb1;
				}
			}
		}
	} else {
		// Solve X*A^T = alpha*B, Right, Lower, Transpose
		for ( k = 0; k < N; k++ ) {
			if ( nounit ) {
				temp = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
				ib = offsetB + (k * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= temp;
					ib += sb1;
				}
			}
			for ( j = k + 1; j < N; j++ ) {
				if ( A[ offsetA + (j * sa1) + (k * sa2) ] !== 0.0 ) {
					temp = A[ offsetA + (j * sa1) + (k * sa2) ];
					for ( i = 0; i < M; i++ ) {
						B[ offsetB + (i * sb1) + (j * sb2) ] -= temp * B[ offsetB + (i * sb1) + (k * sb2) ];
					}
				}
			}
			if ( alpha !== 1.0 ) {
				ib = offsetB + (k * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= alpha;
					ib += sb1;
				}
			}
		}
	}
	return B;
}


// EXPORTS //

export default dtrsm;
