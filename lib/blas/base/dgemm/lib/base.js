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

/* eslint-disable max-len, max-params, max-statements */

// MAIN //

/**
* Performs one of the matrix-matrix operations:.
* C := alpha_op(A)_op(B) + beta*C
* where op(X) is one of X or X**T.
*
* @private
* @param {string} transa - specifies op(A): `'no-transpose'` or `'transpose'`
* @param {string} transb - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of op(A) and C
* @param {NonNegativeInteger} N - number of columns of op(B) and C
* @param {NonNegativeInteger} K - number of columns of op(A) / rows of op(B)
* @param {number} alpha - scalar multiplier for op(A)*op(B)
* @param {Float64Array} A - first input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - second input matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - index offset for C
* @returns {Float64Array} `C`
*/
function dgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var nota;
	var notb;
	var temp;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var ia;
	var ib;
	var ic;
	var i;
	var j;
	var l;

	nota = ( transa === 'no-transpose' );
	notb = ( transb === 'no-transpose' );

	if ( M === 0 || N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;
	sc1 = strideC1;
	sc2 = strideC2;

	// When alpha is zero, just scale C by beta
	if ( alpha === 0.0 ) {
		if ( beta === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					C[ ic ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					C[ ic ] *= beta;
					ic += sc1;
				}
			}
		}
		return C;
	}

	// Start the operations
	if ( notb ) {
		if ( nota ) {
			// C := alpha*A*B + beta*C
			for ( j = 0; j < N; j++ ) {
				if ( beta === 0.0 ) {
					ic = offsetC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						C[ ic ] = 0.0;
						ic += sc1;
					}
				} else if ( beta !== 1.0 ) {
					ic = offsetC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						C[ ic ] *= beta;
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					temp = alpha * B[ offsetB + (l * sb1) + (j * sb2) ];
					ia = offsetA + (l * sa2);
					ic = offsetC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						C[ ic ] += temp * A[ ia ];
						ia += sa1;
						ic += sc1;
					}
				}
			}
		} else {
			// C := alpha*A^T*B + beta*C
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					temp = 0.0;
					ia = offsetA + (i * sa2);
					ib = offsetB + (j * sb2);
					for ( l = 0; l < K; l++ ) {
						temp += A[ ia ] * B[ ib ];
						ia += sa1;
						ib += sb1;
					}
					ic = offsetC + (i * sc1) + (j * sc2);
					if ( beta === 0.0 ) {
						C[ ic ] = alpha * temp;
					} else {
						C[ ic ] = (alpha * temp) + (beta * C[ ic ]);
					}
				}
			}
		}
	} else if ( nota ) {
		// C := alpha*A*B^T + beta*C
		for ( j = 0; j < N; j++ ) {
			if ( beta === 0.0 ) {
				ic = offsetC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					C[ ic ] = 0.0;
					ic += sc1;
				}
			} else if ( beta !== 1.0 ) {
				ic = offsetC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					C[ ic ] *= beta;
					ic += sc1;
				}
			}
			for ( l = 0; l < K; l++ ) {
				temp = alpha * B[ offsetB + (j * sb1) + (l * sb2) ];
				ia = offsetA + (l * sa2);
				ic = offsetC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					C[ ic ] += temp * A[ ia ];
					ia += sa1;
					ic += sc1;
				}
			}
		}
	} else {
		// C := alpha*A^T*B^T + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				temp = 0.0;
				ia = offsetA + (i * sa2);
				ib = offsetB + (j * sb1);
				for ( l = 0; l < K; l++ ) {
					temp += A[ ia ] * B[ ib ];
					ia += sa1;
					ib += sb2;
				}
				ic = offsetC + (i * sc1) + (j * sc2);
				if ( beta === 0.0 ) {
					C[ ic ] = alpha * temp;
				} else {
					C[ ic ] = (alpha * temp) + (beta * C[ ic ]);
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default dgemm;
