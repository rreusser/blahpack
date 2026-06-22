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

/* eslint-disable max-len, max-params, max-depth */

// MODULES //

import dlassq from '../../dlassq/lib/base.js';


// FUNCTIONS //

/**
* Returns the minimum of two values.
*
* @private
* @param {number} a - first value
* @param {number} b - second value
* @returns {number} minimum
*/
function min( a, b ) {
	return ( a < b ) ? a : b;
}


// MAIN //

/**
* Computes the value of the one norm, Frobenius norm, infinity norm, or.
* largest absolute value of a real triangular matrix.
*
* @private
* @param {string} norm - norm type: 'max' (max abs), 'one-norm' (one-norm), 'inf-norm' (infinity-norm), 'frobenius' (Frobenius)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular: 'upper' or 'lower'
* @param {string} diag - specifies whether the diagonal is unit: 'unit' or 'non-unit'
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} WORK - workspace array (length >= M for 'inf-norm')
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {number} norm value
*/
function dlantr( norm, uplo, diag, M, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) {
	var udiag;
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var ai;
	var wi;
	var nn;
	var i;
	var j;

	if ( min( M, N ) === 0 ) {
		return 0.0;
	}

	udiag = ( diag === 'unit' );

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		if ( udiag ) {
			value = 1.0;
			if ( uplo === 'upper' ) {
				// Upper triangular, unit diagonal: iterate over strict upper triangle
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 );
					nn = min( M, j ); // rows 0..min(M,j)-1 (excludes diagonal)
					for ( i = 0; i < nn; i++ ) {
						temp = Math.abs( A[ ai ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += strideA1;
					}
				}
			} else {
				// Lower triangular, unit diagonal: iterate below diagonal
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 ) + ( ( j + 1 ) * strideA1 );
					for ( i = j + 1; i < M; i++ ) {
						temp = Math.abs( A[ ai ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += strideA1;
					}
				}
			}
		} else {
			value = 0.0;
			if ( uplo === 'upper' ) {
				// Upper triangular, non-unit: iterate over upper triangle including diagonal
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 );
					nn = min( M, j + 1 ); // rows 0..min(M,j) (includes diagonal)
					for ( i = 0; i < nn; i++ ) {
						temp = Math.abs( A[ ai ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += strideA1;
					}
				}
			} else {
				// Lower triangular, non-unit: iterate from diagonal down
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 ) + ( j * strideA1 );
					for ( i = j; i < M; i++ ) {
						temp = Math.abs( A[ ai ] );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += strideA1;
					}
				}
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of absolute values
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				if ( udiag && j < M ) {
					// Unit diagonal: start sum at 1 for the diagonal, iterate strict upper
					sum = 1.0;
					ai = offsetA + ( j * strideA2 );
					for ( i = 0; i < j; i++ ) {
						sum += Math.abs( A[ ai ] );
						ai += strideA1;
					}
				} else {
					// Non-unit (or column beyond M): sum the whole column in the triangle
					sum = 0.0;
					ai = offsetA + ( j * strideA2 );
					nn = min( M, j + 1 );
					for ( i = 0; i < nn; i++ ) {
						sum += Math.abs( A[ ai ] );
						ai += strideA1;
					}
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					// Unit diagonal: start sum at 1, iterate below diagonal
					sum = 1.0;
					ai = offsetA + ( j * strideA2 ) + ( ( j + 1 ) * strideA1 );
					for ( i = j + 1; i < M; i++ ) {
						sum += Math.abs( A[ ai ] );
						ai += strideA1;
					}
				} else {
					// Non-unit: sum from diagonal down
					sum = 0.0;
					ai = offsetA + ( j * strideA2 ) + ( j * strideA1 );
					for ( i = j; i < M; i++ ) {
						sum += Math.abs( A[ ai ] );
						ai += strideA1;
					}
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of absolute values
		// Initialize work array with row sums
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				// Unit diagonal: initialize rows 0..M-1 to 1
				for ( i = 0; i < M; i++ ) {
					wi = offsetWORK + ( i * strideWORK );
					WORK[ wi ] = 1.0;
				}
				// Add contributions from strict upper triangle
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 );
					wi = offsetWORK;
					nn = min( M, j ); // rows 0..min(M,j)-1
					for ( i = 0; i < nn; i++ ) {
						WORK[ wi ] += Math.abs( A[ ai ] );
						ai += strideA1;
						wi += strideWORK;
					}
				}
			} else {
				// Non-unit: initialize to 0, sum upper triangle including diagonal
				for ( i = 0; i < M; i++ ) {
					wi = offsetWORK + ( i * strideWORK );
					WORK[ wi ] = 0.0;
				}
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 );
					wi = offsetWORK;
					nn = min( M, j + 1 );
					for ( i = 0; i < nn; i++ ) {
						WORK[ wi ] += Math.abs( A[ ai ] );
						ai += strideA1;
						wi += strideWORK;
					}
				}
			}
		} else {
			// Lower triangular
			if ( udiag ) {
				// Unit diagonal: rows 0..min(M,N)-1 start at 1, rest at 0
				nn = min( M, N );
				for ( i = 0; i < nn; i++ ) {
					wi = offsetWORK + ( i * strideWORK );
					WORK[ wi ] = 1.0;
				}
				for ( i = N; i < M; i++ ) {
					wi = offsetWORK + ( i * strideWORK );
					WORK[ wi ] = 0.0;
				}
				// Add contributions from strict lower triangle
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 ) + ( ( j + 1 ) * strideA1 );
					wi = offsetWORK + ( ( j + 1 ) * strideWORK );
					for ( i = j + 1; i < M; i++ ) {
						WORK[ wi ] += Math.abs( A[ ai ] );
						ai += strideA1;
						wi += strideWORK;
					}
				}
			} else {
				// Non-unit: initialize to 0, sum lower triangle including diagonal
				for ( i = 0; i < M; i++ ) {
					wi = offsetWORK + ( i * strideWORK );
					WORK[ wi ] = 0.0;
				}
				for ( j = 0; j < N; j++ ) {
					ai = offsetA + ( j * strideA2 ) + ( j * strideA1 );
					wi = offsetWORK + ( j * strideWORK );
					for ( i = j; i < M; i++ ) {
						WORK[ wi ] += Math.abs( A[ ai ] );
						ai += strideA1;
						wi += strideWORK;
					}
				}
			}
		}
		// Find maximum row sum
		value = 0.0;
		for ( i = 0; i < M; i++ ) {
			wi = offsetWORK + ( i * strideWORK );
			temp = WORK[ wi ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm using dlassq per column
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				// Unit diagonal contributes min(M,N) ones to sum
				scale = 1.0;
				sum = min( M, N );

				// Strict upper triangle: columns j=1..N-1, rows 0..min(M,j)-1
				for ( j = 1; j < N; j++ ) {
					nn = min( M, j );
					if ( nn > 0 ) {
						out = dlassq( nn, A, strideA1, offsetA + ( j * strideA2 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			} else {
				// Non-unit: upper triangle including diagonal
				scale = 0.0;
				sum = 1.0;
				for ( j = 0; j < N; j++ ) {
					nn = min( M, j + 1 );
					if ( nn > 0 ) {
						out = dlassq( nn, A, strideA1, offsetA + ( j * strideA2 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			}
		} else {
			// Lower triangular
			if ( udiag ) {
				// Unit diagonal contributes min(M,N) ones
				scale = 1.0;
				sum = min( M, N );

				// Strict lower triangle: column j, rows j+1..M-1
				for ( j = 0; j < N; j++ ) {
					nn = M - j - 1;
					if ( nn > 0 ) {
						out = dlassq( nn, A, strideA1, offsetA + ( j * strideA2 ) + ( ( j + 1 ) * strideA1 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			} else {
				// Non-unit: lower triangle including diagonal
				scale = 0.0;
				sum = 1.0;
				for ( j = 0; j < N; j++ ) {
					nn = M - j;
					if ( nn > 0 ) {
						out = dlassq( nn, A, strideA1, offsetA + ( j * strideA2 ) + ( j * strideA1 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlantr;
