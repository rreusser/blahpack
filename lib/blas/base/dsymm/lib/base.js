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

/* eslint-disable max-len, max-params */

// MAIN //

/**
* Performs one of the symmetric matrix-matrix operations:.
* C := alpha_A_B + beta_C, or C := alpha_B_A + beta_C,
* where alpha and beta are scalars, A is a symmetric matrix, and B and C
* are M-by-N matrices.
*
* @private
* @param {string} side - 'left' if A is on the left, 'right' if A is on the right
* @param {string} uplo - 'upper' or 'lower', specifies which triangle of A is stored
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {number} alpha - scalar multiplier for A*B or B*A
* @param {Float64Array} A - symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - input matrix
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
function dsymm( side, uplo, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var upper;
	var lside;
	var temp1;
	var temp2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var ic;
	var i;
	var j;
	var k;

	lside = ( side === 'left' );
	upper = ( uplo === 'upper' );

	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return C;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;
	sc1 = strideC1;
	sc2 = strideC2;

	// When alpha is zero, just scale C
	if ( alpha === 0.0 ) {
		if ( beta === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + ( j * sc2 );
				for ( i = 0; i < M; i++ ) {
					C[ ic ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + ( j * sc2 );
				for ( i = 0; i < M; i++ ) {
					C[ ic ] *= beta;
					ic += sc1;
				}
			}
		}
		return C;
	}

	// Start the operations
	if ( lside ) {
		// C := alpha*A*B + beta*C
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					temp1 = alpha * B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ];
					temp2 = 0.0;
					for ( k = 0; k < i; k++ ) {
						C[ offsetC + ( k * sc1 ) + ( j * sc2 ) ] += temp1 * A[ offsetA + ( k * sa1 ) + ( i * sa2 ) ];
						temp2 += B[ offsetB + ( k * sb1 ) + ( j * sb2 ) ] * A[ offsetA + ( k * sa1 ) + ( i * sa2 ) ];
					}
					if ( beta === 0.0 ) {
						C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] = ( temp1 * A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] ) + ( alpha * temp2 );
					} else {
						C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] = ( beta * C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] ) + ( temp1 * A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] ) + ( alpha * temp2 );
					}
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				for ( i = M - 1; i >= 0; i-- ) {
					temp1 = alpha * B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ];
					temp2 = 0.0;
					for ( k = i + 1; k < M; k++ ) {
						C[ offsetC + ( k * sc1 ) + ( j * sc2 ) ] += temp1 * A[ offsetA + ( k * sa1 ) + ( i * sa2 ) ];
						temp2 += B[ offsetB + ( k * sb1 ) + ( j * sb2 ) ] * A[ offsetA + ( k * sa1 ) + ( i * sa2 ) ];
					}
					if ( beta === 0.0 ) {
						C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] = ( temp1 * A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] ) + ( alpha * temp2 );
					} else {
						C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] = ( beta * C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] ) + ( temp1 * A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] ) + ( alpha * temp2 );
					}
				}
			}
		}
	} else {
		// C := alpha*B*A + beta*C
		for ( j = 0; j < N; j++ ) {
			temp1 = alpha * A[ offsetA + ( j * sa1 ) + ( j * sa2 ) ];
			if ( beta === 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] = temp1 * B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ];
				}
			} else {
				for ( i = 0; i < M; i++ ) {
					C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] = ( beta * C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] ) + ( temp1 * B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ] );
				}
			}
			for ( k = 0; k < j; k++ ) {
				if ( upper ) {
					temp1 = alpha * A[ offsetA + ( k * sa1 ) + ( j * sa2 ) ];
				} else {
					temp1 = alpha * A[ offsetA + ( j * sa1 ) + ( k * sa2 ) ];
				}
				for ( i = 0; i < M; i++ ) {
					C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] += temp1 * B[ offsetB + ( i * sb1 ) + ( k * sb2 ) ];
				}
			}
			for ( k = j + 1; k < N; k++ ) {
				if ( upper ) {
					temp1 = alpha * A[ offsetA + ( j * sa1 ) + ( k * sa2 ) ];
				} else {
					temp1 = alpha * A[ offsetA + ( k * sa1 ) + ( j * sa2 ) ];
				}
				for ( i = 0; i < M; i++ ) {
					C[ offsetC + ( i * sc1 ) + ( j * sc2 ) ] += temp1 * B[ offsetB + ( i * sb1 ) + ( k * sb2 ) ];
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default dsymm;
