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
* Performs one of the symmetric rank-k operations:.
* C := alpha_A_A^T + beta_C,  or  C := alpha_A^T_A + beta_C
* where alpha and beta are scalars, C is an N-by-N symmetric matrix,
* and A is an N-by-K matrix in the first case and a K-by-N matrix in
* the second case. Only the upper or lower triangular part of C is
* updated.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans = 'no-transpose') or rows (if trans = 'transpose')
* @param {number} alpha - scalar multiplier for A*A^T or A^T*A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - index offset for C
* @returns {Float64Array} `C`
*/
function dsyrk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
	var upper;
	var nota;
	var temp;
	var sa1;
	var sa2;
	var sc1;
	var sc2;
	var ic;
	var ia;
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
	sc1 = strideC1;
	sc2 = strideC2;

	// When alpha is zero, just scale C.
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
		// C := alpha*A*A^T + beta*C.
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
					if ( A[ offsetA + (j * sa1) + (l * sa2) ] !== 0.0 ) {
						temp = alpha * A[ offsetA + (j * sa1) + (l * sa2) ];
						ia = offsetA + (l * sa2);
						ic = offsetC + (j * sc2);
						for ( i = 0; i <= j; i++ ) {
							C[ ic ] += temp * A[ ia ];
							ia += sa1;
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
					if ( A[ offsetA + (j * sa1) + (l * sa2) ] !== 0.0 ) {
						temp = alpha * A[ offsetA + (j * sa1) + (l * sa2) ];
						ia = offsetA + (j * sa1) + (l * sa2);
						ic = offsetC + (j * sc1) + (j * sc2);
						for ( i = j; i < N; i++ ) {
							C[ ic ] += temp * A[ ia ];
							ia += sa1;
							ic += sc1;
						}
					}
				}
			}
		}
	// C := alpha*A^T*A + beta*C.
	} else if ( upper ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				temp = 0.0;
				for ( l = 0; l < K; l++ ) {
					temp += A[ offsetA + (l * sa1) + (i * sa2) ] * A[ offsetA + (l * sa1) + (j * sa2) ];
				}
				if ( beta === 0.0 ) {
					C[ offsetC + (i * sc1) + (j * sc2) ] = alpha * temp;
				} else {
					C[ offsetC + (i * sc1) + (j * sc2) ] = (alpha * temp) + (beta * C[ offsetC + (i * sc1) + (j * sc2) ]);
				}
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				temp = 0.0;
				for ( l = 0; l < K; l++ ) {
					temp += A[ offsetA + (l * sa1) + (i * sa2) ] * A[ offsetA + (l * sa1) + (j * sa2) ];
				}
				if ( beta === 0.0 ) {
					C[ offsetC + (i * sc1) + (j * sc2) ] = alpha * temp;
				} else {
					C[ offsetC + (i * sc1) + (j * sc2) ] = (alpha * temp) + (beta * C[ offsetC + (i * sc1) + (j * sc2) ]);
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default dsyrk;
