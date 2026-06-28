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

/* eslint-disable max-len, max-params, max-statements */

// MAIN //

/**
* Performs one of the symmetric rank-2k operations:.
* C := alpha_A_B^T + alpha_B_A^T + beta_C,  or
* C := alpha_A^T_B + alpha_B^T_A + beta_C
* where alpha and beta are scalars, C is an N-by-N symmetric matrix,
* and A and B are N-by-K matrices in the first case and K-by-N matrices
* in the second case. Only the upper or lower triangular part of C is
* updated.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A and B (if trans = 'no-transpose') or rows (if trans = 'transpose')
* @param {number} alpha - scalar multiplier for A*B^T + B*A^T
* @param {Float64Array} A - first input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - second input matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - index offset for C
* @returns {Float64Array} `C`
*/
function dsyr2k( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var upper;
	var temp1;
	var temp2;
	var nota;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var ic;
	var ia;
	var ib;
	var i;
	var j;
	var l;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;
	sc1 = strideC1;
	sc2 = strideC2;

	// When alpha is zero, just scale C...
	if ( alpha === 0.0 ) {
		if ( upper ) {
			if ( beta === 0.0 ) {
				for ( j = 0; j < N; j++ ) {
					ic = offsetC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						C[ ic ] = 0.0;
						ic += sc1;
					}
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					ic = offsetC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						C[ ic ] *= beta;
						ic += sc1;
					}
				}
			}
		} else if ( beta === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + (j * sc1) + (j * sc2);
				for ( i = j; i < N; i++ ) {
					C[ ic ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + (j * sc1) + (j * sc2);
				for ( i = j; i < N; i++ ) {
					C[ ic ] *= beta;
					ic += sc1;
				}
			}
		}
		return C;
	}

	if ( nota ) {
		// C := alpha*A*B^T + alpha*B*A^T + beta*C
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				if ( beta === 0.0 ) {
					ic = offsetC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						C[ ic ] = 0.0;
						ic += sc1;
					}
				} else if ( beta !== 1.0 ) {
					ic = offsetC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						C[ ic ] *= beta;
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					if ( A[ offsetA + (j * sa1) + (l * sa2) ] !== 0.0 ||
						B[ offsetB + (j * sb1) + (l * sb2) ] !== 0.0 ) {
						temp1 = alpha * B[ offsetB + (j * sb1) + (l * sb2) ];
						temp2 = alpha * A[ offsetA + (j * sa1) + (l * sa2) ];
						ia = offsetA + (l * sa2);
						ib = offsetB + (l * sb2);
						ic = offsetC + (j * sc2);
						for ( i = 0; i <= j; i++ ) {
							C[ ic ] += (A[ ia ] * temp1) + (B[ ib ] * temp2);
							ia += sa1;
							ib += sb1;
							ic += sc1;
						}
					}
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				if ( beta === 0.0 ) {
					ic = offsetC + (j * sc1) + (j * sc2);
					for ( i = j; i < N; i++ ) {
						C[ ic ] = 0.0;
						ic += sc1;
					}
				} else if ( beta !== 1.0 ) {
					ic = offsetC + (j * sc1) + (j * sc2);
					for ( i = j; i < N; i++ ) {
						C[ ic ] *= beta;
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					if ( A[ offsetA + (j * sa1) + (l * sa2) ] !== 0.0 ||
						B[ offsetB + (j * sb1) + (l * sb2) ] !== 0.0 ) {
						temp1 = alpha * B[ offsetB + (j * sb1) + (l * sb2) ];
						temp2 = alpha * A[ offsetA + (j * sa1) + (l * sa2) ];
						ia = offsetA + (j * sa1) + (l * sa2);
						ib = offsetB + (j * sb1) + (l * sb2);
						ic = offsetC + (j * sc1) + (j * sc2);
						for ( i = j; i < N; i++ ) {
							C[ ic ] += (A[ ia ] * temp1) + (B[ ib ] * temp2);
							ia += sa1;
							ib += sb1;
							ic += sc1;
						}
					}
				}
			}
		}
	} else if ( upper ) {
		// C := alpha*A^T*B + alpha*B^T*A + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				temp1 = 0.0;
				temp2 = 0.0;
				for ( l = 0; l < K; l++ ) {
					temp1 += A[ offsetA + (l * sa1) + (i * sa2) ] * B[ offsetB + (l * sb1) + (j * sb2) ];
					temp2 += B[ offsetB + (l * sb1) + (i * sb2) ] * A[ offsetA + (l * sa1) + (j * sa2) ];
				}
				if ( beta === 0.0 ) {
					C[ offsetC + (i * sc1) + (j * sc2) ] = (alpha * temp1) + (alpha * temp2);
				} else {
					C[ offsetC + (i * sc1) + (j * sc2) ] = (beta * C[ offsetC + (i * sc1) + (j * sc2) ]) + (alpha * temp1) + (alpha * temp2);
				}
			}
		}
	} else {
		// C := alpha*A^T*B + alpha*B^T*A + beta*C (lower)
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				temp1 = 0.0;
				temp2 = 0.0;
				for ( l = 0; l < K; l++ ) {
					temp1 += A[ offsetA + (l * sa1) + (i * sa2) ] * B[ offsetB + (l * sb1) + (j * sb2) ];
					temp2 += B[ offsetB + (l * sb1) + (i * sb2) ] * A[ offsetA + (l * sa1) + (j * sa2) ];
				}
				if ( beta === 0.0 ) {
					C[ offsetC + (i * sc1) + (j * sc2) ] = (alpha * temp1) + (alpha * temp2);
				} else {
					C[ offsetC + (i * sc1) + (j * sc2) ] = (beta * C[ offsetC + (i * sc1) + (j * sc2) ]) + (alpha * temp1) + (alpha * temp2);
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default dsyr2k;
