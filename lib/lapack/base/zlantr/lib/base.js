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

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Computes the value of a matrix norm for a complex triangular or trapezoidal matrix.
*
* Supports norms: `'max'`, `'one-norm'`, `'inf-norm'`, `'frobenius'`.
*
* @private
* @param {string} norm - norm type: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Complex128Array} A - complex matrix
* @param {integer} strideA1 - first dimension stride (in complex elements)
* @param {integer} strideA2 - second dimension stride (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace (length >= M for `'inf-norm'`, real)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function zlantr( norm, uplo, diag, M, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	var udiag;
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var ai;
	var wi;
	var mn;
	var i;
	var j;

	mn = ( M < N ) ? M : N;

	if ( mn === 0 ) {
		return 0.0;
	}

	// Get Float64 view and convert strides/offset from complex elements to doubles
	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	udiag = ( diag === 'unit' );

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		if ( udiag ) {
			value = 1.0;
			if ( uplo === 'upper' ) {
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 );

					// i from 0 to min(M, j) - 1 (i.e. rows above the diagonal)
					for ( i = 0; i < M && i < j; i++ ) {
						temp = cmplx.absAt( Av, ai );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += sa1;
					}
				}
			} else {
				// Lower
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 ) + ( ( j + 1 ) * sa1 );
					for ( i = j + 1; i < M; i++ ) {
						temp = cmplx.absAt( Av, ai );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += sa1;
					}
				}
			}
		} else {
			value = 0.0;
			if ( uplo === 'upper' ) {
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 );

					// i from 0 to min(M, j+1) - 1 (includes diagonal)
					for ( i = 0; i < M && i <= j; i++ ) {
						temp = cmplx.absAt( Av, ai );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += sa1;
					}
				}
			} else {
				// Lower
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 ) + ( j * sa1 );
					for ( i = j; i < M; i++ ) {
						temp = cmplx.absAt( Av, ai );
						if ( value < temp || temp !== temp ) {
							value = temp;
						}
						ai += sa1;
					}
				}
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of abs values
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				if ( udiag && j < M ) {
					// Unit diagonal: start sum at 1.0, skip diagonal element
					sum = 1.0;
					ai = oA + ( j * sa2 );
					for ( i = 0; i < j; i++ ) {
						sum += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				} else {
					sum = 0.0;
					ai = oA + ( j * sa2 );
					for ( i = 0; i < M && i <= j; i++ ) {
						sum += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			// Lower
			for ( j = 0; j < N; j++ ) {
				if ( udiag ) {
					sum = 1.0;
					ai = oA + ( j * sa2 ) + ( ( j + 1 ) * sa1 );
					for ( i = j + 1; i < M; i++ ) {
						sum += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				} else {
					sum = 0.0;
					ai = oA + ( j * sa2 ) + ( j * sa1 );
					for ( i = j; i < M; i++ ) {
						sum += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of abs values
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				for ( i = 0; i < M; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
				}
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 );
					for ( i = 0; i < M && i < j; i++ ) {
						wi = offsetWork + ( i * strideWork );
						WORK[ wi ] += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				}
			} else {
				for ( i = 0; i < M; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
				}
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 );
					for ( i = 0; i < M && i <= j; i++ ) {
						wi = offsetWork + ( i * strideWork );
						WORK[ wi ] += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				}
			}
		} else {
			// Lower
			if ( udiag ) {
				for ( i = 0; i < mn; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 1.0;
				}
				for ( i = N; i < M; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
				}
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 ) + ( ( j + 1 ) * sa1 );
					for ( i = j + 1; i < M; i++ ) {
						wi = offsetWork + ( i * strideWork );
						WORK[ wi ] += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				}
			} else {
				for ( i = 0; i < M; i++ ) {
					WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
				}
				for ( j = 0; j < N; j++ ) {
					ai = oA + ( j * sa2 ) + ( j * sa1 );
					for ( i = j; i < M; i++ ) {
						wi = offsetWork + ( i * strideWork );
						WORK[ wi ] += cmplx.absAt( Av, ai );
						ai += sa1;
					}
				}
			}
		}
		value = 0.0;
		for ( i = 0; i < M; i++ ) {
			temp = WORK[ offsetWork + ( i * strideWork ) ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm using zlassq per column
		if ( uplo === 'upper' ) {
			if ( udiag ) {
				scale = 1.0;
				sum = mn; // min(M,N) unit diagonal elements, each with |1|^2 = 1
				for ( j = 1; j < N; j++ ) {
					// Column j: rows 0 to min(M, j) - 1 (above diagonal)
					out = zlassq( ( M < j ) ? M : j, A, strideA1, offsetA + ( j * strideA2 ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
				}
			} else {
				scale = 0.0;
				sum = 1.0;
				for ( j = 0; j < N; j++ ) {
					// Column j: rows 0 to min(M, j+1) - 1
					out = zlassq( ( M < j + 1 ) ? M : ( j + 1 ), A, strideA1, offsetA + ( j * strideA2 ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
				}
			}
		} else {
			// Lower
			if ( udiag ) {
				scale = 1.0;
				sum = mn;
				for ( j = 0; j < N; j++ ) {
					// Column j: rows j+1 to M-1 (below diagonal)
					if ( M - j - 1 > 0 ) {
						out = zlassq( M - j - 1, A, strideA1, offsetA + ( ( ( j + 1 < M ) ? j + 1 : M ) * strideA1 ) + ( j * strideA2 ), scale, sum );
						scale = out.scl;
						sum = out.sumsq;
					}
				}
			} else {
				scale = 0.0;
				sum = 1.0;
				for ( j = 0; j < N; j++ ) {
					// Column j: rows j to M-1
					out = zlassq( M - j, A, strideA1, offsetA + ( j * strideA1 ) + ( j * strideA2 ), scale, sum );
					scale = out.scl;
					sum = out.sumsq;
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

export default zlantr;
