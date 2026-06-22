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

// MAIN //

/**
* Performs one of the matrix-matrix operations.
*
*   B := alpha _ A _ X + beta _ B    (trans = 'no-transpose')
_   B := alpha _ A^T _ X + beta _ B  (trans = 'transpose')
*
* where A is an N-by-N general tridiagonal matrix with sub-diagonal DL,
* diagonal D, and super-diagonal DU; X is an N-by-NRHS matrix; and B is
* an N-by-NRHS matrix.
*
* Only alpha = 1 or -1 is handled; other alpha values leave B unchanged
* after the beta scaling.
*
* @private
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of X and B)
* @param {number} alpha - scalar multiplier (must be 1.0 or -1.0)
* @param {Float64Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - starting index for DL
* @param {Float64Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - starting index for DU
* @param {Float64Array} X - input matrix (N x NRHS)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {number} beta - scalar multiplier for B (0, 1, or -1)
* @param {Float64Array} B - input/output matrix (N x NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
*/
function dlagtm( trans, N, nrhs, alpha, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, X, strideX1, strideX2, offsetX, beta, B, strideB1, strideB2, offsetB ) {
	var pb;
	var px;
	var i;
	var j;

	if ( N === 0 ) {
		return;
	}

	// Scale B by beta
	if ( beta === 0.0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			pb = offsetB + ( j * strideB2 );
			for ( i = 0; i < N; i++ ) {
				B[ pb ] = 0.0;
				pb += strideB1;
			}
		}
	} else if ( beta === -1.0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			pb = offsetB + ( j * strideB2 );
			for ( i = 0; i < N; i++ ) {
				B[ pb ] = -B[ pb ];
				pb += strideB1;
			}
		}
	}
	// beta === 1.0: leave B unchanged

	if ( alpha === 1.0 ) {
		if ( trans === 'no-transpose' ) {
			// B += A * X
			for ( j = 0; j < nrhs; j++ ) {
				px = offsetX + ( j * strideX2 );
				pb = offsetB + ( j * strideB2 );
				if ( N === 1 ) {
					B[ pb ] += d[ offsetD ] * X[ px ];
				} else {
					// First row
					B[ pb ] += d[ offsetD ] * X[ px ] + DU[ offsetDU ] * X[ px + strideX1 ];

					// Last row
					B[ pb + ( ( N - 1 ) * strideB1 ) ] += DL[ offsetDL + ( ( N - 2 ) * strideDL ) ] * X[ px + ( ( N - 2 ) * strideX1 ) ] + d[ offsetD + ( ( N - 1 ) * strideD ) ] * X[ px + ( ( N - 1 ) * strideX1 ) ];

					// Middle rows
					for ( i = 1; i < N - 1; i++ ) {
						B[ pb + ( i * strideB1 ) ] += DL[ offsetDL + ( ( i - 1 ) * strideDL ) ] * X[ px + ( ( i - 1 ) * strideX1 ) ] + d[ offsetD + ( i * strideD ) ] * X[ px + ( i * strideX1 ) ] + DU[ offsetDU + ( i * strideDU ) ] * X[ px + ( ( i + 1 ) * strideX1 ) ];
					}
				}
			}
		} else {
			// B += A^T * X
			for ( j = 0; j < nrhs; j++ ) {
				px = offsetX + ( j * strideX2 );
				pb = offsetB + ( j * strideB2 );
				if ( N === 1 ) {
					B[ pb ] += d[ offsetD ] * X[ px ];
				} else {
					// First row: A^T row 0 = d[0], dl[0] (from column 0 of A^T = row 0 of A)
					B[ pb ] += d[ offsetD ] * X[ px ] + DL[ offsetDL ] * X[ px + strideX1 ];

					// Last row
					B[ pb + ( ( N - 1 ) * strideB1 ) ] += DU[ offsetDU + ( ( N - 2 ) * strideDU ) ] * X[ px + ( ( N - 2 ) * strideX1 ) ] + d[ offsetD + ( ( N - 1 ) * strideD ) ] * X[ px + ( ( N - 1 ) * strideX1 ) ];

					// Middle rows
					for ( i = 1; i < N - 1; i++ ) {
						B[ pb + ( i * strideB1 ) ] += DU[ offsetDU + ( ( i - 1 ) * strideDU ) ] * X[ px + ( ( i - 1 ) * strideX1 ) ] + d[ offsetD + ( i * strideD ) ] * X[ px + ( i * strideX1 ) ] + DL[ offsetDL + ( i * strideDL ) ] * X[ px + ( ( i + 1 ) * strideX1 ) ];
					}
				}
			}
		}
	} else if ( alpha === -1.0 ) {
		if ( trans === 'no-transpose' ) {
			// B -= A * X
			for ( j = 0; j < nrhs; j++ ) {
				px = offsetX + ( j * strideX2 );
				pb = offsetB + ( j * strideB2 );
				if ( N === 1 ) {
					B[ pb ] -= d[ offsetD ] * X[ px ];
				} else {
					B[ pb ] -= d[ offsetD ] * X[ px ] + DU[ offsetDU ] * X[ px + strideX1 ];
					B[ pb + ( ( N - 1 ) * strideB1 ) ] -= DL[ offsetDL + ( ( N - 2 ) * strideDL ) ] * X[ px + ( ( N - 2 ) * strideX1 ) ] + d[ offsetD + ( ( N - 1 ) * strideD ) ] * X[ px + ( ( N - 1 ) * strideX1 ) ];
					for ( i = 1; i < N - 1; i++ ) {
						B[ pb + ( i * strideB1 ) ] -= DL[ offsetDL + ( ( i - 1 ) * strideDL ) ] * X[ px + ( ( i - 1 ) * strideX1 ) ] + d[ offsetD + ( i * strideD ) ] * X[ px + ( i * strideX1 ) ] + DU[ offsetDU + ( i * strideDU ) ] * X[ px + ( ( i + 1 ) * strideX1 ) ];
					}
				}
			}
		} else {
			// B -= A^T * X
			for ( j = 0; j < nrhs; j++ ) {
				px = offsetX + ( j * strideX2 );
				pb = offsetB + ( j * strideB2 );
				if ( N === 1 ) {
					B[ pb ] -= d[ offsetD ] * X[ px ];
				} else {
					B[ pb ] -= d[ offsetD ] * X[ px ] + DL[ offsetDL ] * X[ px + strideX1 ];
					B[ pb + ( ( N - 1 ) * strideB1 ) ] -= DU[ offsetDU + ( ( N - 2 ) * strideDU ) ] * X[ px + ( ( N - 2 ) * strideX1 ) ] + d[ offsetD + ( ( N - 1 ) * strideD ) ] * X[ px + ( ( N - 1 ) * strideX1 ) ];
					for ( i = 1; i < N - 1; i++ ) {
						B[ pb + ( i * strideB1 ) ] -= DU[ offsetDU + ( ( i - 1 ) * strideDU ) ] * X[ px + ( ( i - 1 ) * strideX1 ) ] + d[ offsetD + ( i * strideD ) ] * X[ px + ( i * strideX1 ) ] + DL[ offsetDL + ( i * strideDL ) ] * X[ px + ( ( i + 1 ) * strideX1 ) ];
					}
				}
			}
		}
	}
	// alpha === 0: no multiply needed
}


// EXPORTS //

export default dlagtm;
