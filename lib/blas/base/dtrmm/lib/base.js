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

/* eslint-disable max-depth, max-len, max-params, max-statements */

// MAIN //

/**
* Performs one of the matrix-matrix operations.
* B := alpha_op(A)_B,  or  B := alpha_B_op(A)
*
* where alpha is a scalar, B is an M-by-N matrix, A is a unit or
* non-unit, upper or lower triangular matrix, and op(A) is A or A**T.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier
* @param {Float64Array} A - triangular matrix
* @param {integer} strideA1 - stride of first dim of A
* @param {integer} strideA2 - stride of second dim of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - matrix, modified in-place
* @param {integer} strideB1 - stride of first dim of B
* @param {integer} strideB2 - stride of second dim of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @returns {Float64Array} B
*/
function dtrmm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
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

	if ( M === 0 || N === 0 ) {
		return B;
	}

	lside = ( side === 'left' );
	upper = ( uplo === 'upper' );
	nounit = ( diag === 'non-unit' );

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
			// B := alpha*A*B
			if ( upper ) {
				for ( j = 0; j < N; j++ ) {
					for ( k = 0; k < M; k++ ) {
						ib = offsetB + (k * sb1) + (j * sb2);
						if ( B[ ib ] !== 0.0 ) {
							temp = alpha * B[ ib ];
							ia = offsetA + (k * sa2);
							for ( i = 0; i < k; i++ ) {
								B[ offsetB + (i * sb1) + (j * sb2) ] += temp * A[ ia ];
								ia += sa1;
							}
							if ( nounit ) {
								B[ ib ] = temp * A[ offsetA + (k * sa1) + (k * sa2) ];
							} else {
								B[ ib ] = temp;
							}
						}
					}
				}
			} else {
				// Lower
				for ( j = 0; j < N; j++ ) {
					for ( k = M - 1; k >= 0; k-- ) {
						ib = offsetB + (k * sb1) + (j * sb2);
						if ( B[ ib ] !== 0.0 ) {
							temp = alpha * B[ ib ];
							B[ ib ] = temp;
							if ( nounit ) {
								B[ ib ] = temp * A[ offsetA + (k * sa1) + (k * sa2) ];
							}
							ia = offsetA + (( k + 1 ) * sa1) + (k * sa2);
							for ( i = k + 1; i < M; i++ ) {
								B[ offsetB + (i * sb1) + (j * sb2) ] += temp * A[ ia ];
								ia += sa1;
							}
						}
					}
				}
			}
		} else if ( upper ) {
			// B := alpha*A**T*B, upper
			for ( j = 0; j < N; j++ ) {
				for ( i = M - 1; i >= 0; i-- ) {
					temp = B[ offsetB + (i * sb1) + (j * sb2) ];
					if ( nounit ) {
						temp *= A[ offsetA + (i * sa1) + (i * sa2) ];
					}
					ia = offsetA + (i * sa2);
					for ( k = 0; k < i; k++ ) {
						temp += A[ ia ] * B[ offsetB + (k * sb1) + (j * sb2) ];
						ia += sa1;
					}
					B[ offsetB + (i * sb1) + (j * sb2) ] = alpha * temp;
				}
			}
		} else {
			// B := alpha*A**T*B, lower
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					temp = B[ offsetB + (i * sb1) + (j * sb2) ];
					if ( nounit ) {
						temp *= A[ offsetA + (i * sa1) + (i * sa2) ];
					}
					for ( k = i + 1; k < M; k++ ) {
						temp += A[ offsetA + (k * sa1) + (i * sa2) ] * B[ offsetB + (k * sb1) + (j * sb2) ];
					}
					B[ offsetB + (i * sb1) + (j * sb2) ] = alpha * temp;
				}
			}
		}
	} else if ( transa === 'no-transpose' ) {
		// Right side: B := alpha*B*A
		if ( upper ) {
			for ( j = N - 1; j >= 0; j-- ) {
				temp = alpha;
				if ( nounit ) {
					temp *= A[ offsetA + (j * sa1) + (j * sa2) ];
				}
				ib = offsetB + (j * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= temp;
					ib += sb1;
				}
				for ( k = 0; k < j; k++ ) {
					if ( A[ offsetA + (k * sa1) + (j * sa2) ] !== 0.0 ) {
						temp = alpha * A[ offsetA + (k * sa1) + (j * sa2) ];
						for ( i = 0; i < M; i++ ) {
							B[ offsetB + (i * sb1) + (j * sb2) ] += temp * B[ offsetB + (i * sb1) + (k * sb2) ];
						}
					}
				}
			}
		} else {
			// Lower
			for ( j = 0; j < N; j++ ) {
				temp = alpha;
				if ( nounit ) {
					temp *= A[ offsetA + (j * sa1) + (j * sa2) ];
				}
				ib = offsetB + (j * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= temp;
					ib += sb1;
				}
				for ( k = j + 1; k < N; k++ ) {
					if ( A[ offsetA + (k * sa1) + (j * sa2) ] !== 0.0 ) {
						temp = alpha * A[ offsetA + (k * sa1) + (j * sa2) ];
						for ( i = 0; i < M; i++ ) {
							B[ offsetB + (i * sb1) + (j * sb2) ] += temp * B[ offsetB + (i * sb1) + (k * sb2) ];
						}
					}
				}
			}
		}
	} else if ( upper ) {
		// B := alpha*B*A**T, upper
		for ( k = 0; k < N; k++ ) {
			for ( j = 0; j < k; j++ ) {
				if ( A[ offsetA + (j * sa1) + (k * sa2) ] !== 0.0 ) {
					temp = alpha * A[ offsetA + (j * sa1) + (k * sa2) ];
					for ( i = 0; i < M; i++ ) {
						B[ offsetB + (i * sb1) + (j * sb2) ] += temp * B[ offsetB + (i * sb1) + (k * sb2) ];
					}
				}
			}
			temp = alpha;
			if ( nounit ) {
				temp *= A[ offsetA + (k * sa1) + (k * sa2) ];
			}
			if ( temp !== 1.0 ) {
				ib = offsetB + (k * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= temp;
					ib += sb1;
				}
			}
		}
	} else {
		// B := alpha*B*A**T, lower
		for ( k = N - 1; k >= 0; k-- ) {
			for ( j = k + 1; j < N; j++ ) {
				if ( A[ offsetA + (j * sa1) + (k * sa2) ] !== 0.0 ) {
					temp = alpha * A[ offsetA + (j * sa1) + (k * sa2) ];
					for ( i = 0; i < M; i++ ) {
						B[ offsetB + (i * sb1) + (j * sb2) ] += temp * B[ offsetB + (i * sb1) + (k * sb2) ];
					}
				}
			}
			temp = alpha;
			if ( nounit ) {
				temp *= A[ offsetA + (k * sa1) + (k * sa2) ];
			}
			if ( temp !== 1.0 ) {
				ib = offsetB + (k * sb2);
				for ( i = 0; i < M; i++ ) {
					B[ ib ] *= temp;
					ib += sb1;
				}
			}
		}
	}
	return B;
}


// EXPORTS //

export default dtrmm;
