/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Applies a sequence of real plane rotations to a real general rectangular matrix.
*
* When SIDE = 'L', the transformation takes the form:
* `A := P*A`
* When SIDE = 'R', the transformation takes the form:
* A := A*P^T
*
* where P is an orthogonal matrix consisting of a sequence of z plane
* rotations, with z = M-1 when SIDE = 'L' and z = N-1 when SIDE = 'R',
* and P^T is the transpose of P.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} pivot - `'variable'`, `'top'`, or `'bottom'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} c - array of cosines
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} s - array of sines
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {Float64Array} A
*/
function dlasr( side, pivot, direct, M, N, c, strideC, offsetC, s, strideS, offsetS, A, strideA1, strideA2, offsetA ) {
	var ctemp;
	var stemp;
	var base1;
	var base2;
	var temp;
	var idx1;
	var idx2;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return A;
	}

	if ( side === 'left' ) {
		// Apply rotations from the left (act on rows)
		if ( pivot === 'variable' ) {
			if ( direct === 'forward' ) {
				// Variable pivot, forward direction
				for ( j = 0; j < M - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (( j + 1 ) * strideA1);
						base2 = offsetA + (j * strideA1);
						for ( i = 0; i < N; i++ ) {
							idx1 = base1 + (i * strideA2);
							idx2 = base2 + (i * strideA2);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			} else {
				// Variable pivot, backward direction
				for ( j = M - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (( j + 1 ) * strideA1);
						base2 = offsetA + (j * strideA1);
						for ( i = 0; i < N; i++ ) {
							idx1 = base1 + (i * strideA2);
							idx2 = base2 + (i * strideA2);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			}
		} else if ( pivot === 'top' ) {
			base2 = offsetA; // row 0 is constant
			if ( direct === 'forward' ) {
				// Top pivot, forward direction
				for ( j = 1; j < M; j++ ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA1);
						for ( i = 0; i < N; i++ ) {
							idx1 = base1 + (i * strideA2);
							idx2 = base2 + (i * strideA2);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			} else {
				// Top pivot, backward direction
				for ( j = M - 1; j >= 1; j-- ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA1);
						for ( i = 0; i < N; i++ ) {
							idx1 = base1 + (i * strideA2);
							idx2 = base2 + (i * strideA2);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			}
		} else if ( pivot === 'bottom' ) {
			base2 = offsetA + (( M - 1 ) * strideA1); // bottom row is constant
			if ( direct === 'forward' ) {
				// Bottom pivot, forward direction
				for ( j = 0; j < M - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA1);
						for ( i = 0; i < N; i++ ) {
							idx1 = base1 + (i * strideA2);
							idx2 = base2 + (i * strideA2);
							temp = A[ idx1 ];
							A[ idx1 ] = (stemp * A[ idx2 ]) + (ctemp * temp);
							A[ idx2 ] = (ctemp * A[ idx2 ]) - (stemp * temp);
						}
					}
				}
			} else {
				// Bottom pivot, backward direction
				for ( j = M - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA1);
						for ( i = 0; i < N; i++ ) {
							idx1 = base1 + (i * strideA2);
							idx2 = base2 + (i * strideA2);
							temp = A[ idx1 ];
							A[ idx1 ] = (stemp * A[ idx2 ]) + (ctemp * temp);
							A[ idx2 ] = (ctemp * A[ idx2 ]) - (stemp * temp);
						}
					}
				}
			}
		}
	} else if ( side === 'right' ) {
		// Apply rotations from the right (act on columns)
		if ( pivot === 'variable' ) {
			if ( direct === 'forward' ) {
				// Variable pivot, forward direction
				for ( j = 0; j < N - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (( j + 1 ) * strideA2);
						base2 = offsetA + (j * strideA2);
						for ( i = 0; i < M; i++ ) {
							idx1 = base1 + (i * strideA1);
							idx2 = base2 + (i * strideA1);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			} else {
				// Variable pivot, backward direction
				for ( j = N - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (( j + 1 ) * strideA2);
						base2 = offsetA + (j * strideA2);
						for ( i = 0; i < M; i++ ) {
							idx1 = base1 + (i * strideA1);
							idx2 = base2 + (i * strideA1);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			}
		} else if ( pivot === 'top' ) {
			base2 = offsetA; // col 0 is constant
			if ( direct === 'forward' ) {
				// Top pivot, forward direction
				for ( j = 1; j < N; j++ ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA2);
						for ( i = 0; i < M; i++ ) {
							idx1 = base1 + (i * strideA1);
							idx2 = base2 + (i * strideA1);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			} else {
				// Top pivot, backward direction
				for ( j = N - 1; j >= 1; j-- ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA2);
						for ( i = 0; i < M; i++ ) {
							idx1 = base1 + (i * strideA1);
							idx2 = base2 + (i * strideA1);
							temp = A[ idx1 ];
							A[ idx1 ] = (ctemp * temp) - (stemp * A[ idx2 ]);
							A[ idx2 ] = (stemp * temp) + (ctemp * A[ idx2 ]);
						}
					}
				}
			}
		} else if ( pivot === 'bottom' ) {
			base2 = offsetA + (( N - 1 ) * strideA2); // last col is constant
			if ( direct === 'forward' ) {
				// Bottom pivot, forward direction
				for ( j = 0; j < N - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA2);
						for ( i = 0; i < M; i++ ) {
							idx1 = base1 + (i * strideA1);
							idx2 = base2 + (i * strideA1);
							temp = A[ idx1 ];
							A[ idx1 ] = (stemp * A[ idx2 ]) + (ctemp * temp);
							A[ idx2 ] = (ctemp * A[ idx2 ]) - (stemp * temp);
						}
					}
				}
			} else {
				// Bottom pivot, backward direction
				for ( j = N - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						base1 = offsetA + (j * strideA2);
						for ( i = 0; i < M; i++ ) {
							idx1 = base1 + (i * strideA1);
							idx2 = base2 + (i * strideA1);
							temp = A[ idx1 ];
							A[ idx1 ] = (stemp * A[ idx2 ]) + (ctemp * temp);
							A[ idx2 ] = (ctemp * A[ idx2 ]) - (stemp * temp);
						}
					}
				}
			}
		}
	}
	return A;
}


// EXPORTS //

export default dlasr;
