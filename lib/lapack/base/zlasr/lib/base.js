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


// MAIN //

/**
* Applies a sequence of real plane rotations to a complex general matrix.
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
* C and S are real arrays with simple stride/offset.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} pivot - `'variable'`, `'top'`, or `'bottom'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} c - array of cosines (real)
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} s - array of sines (real)
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} A
*/
function zlasr( side, pivot, direct, M, N, c, strideC, offsetC, s, strideS, offsetS, A, strideA1, strideA2, offsetA ) {
	var tempRe;
	var tempIm;
	var ctemp;
	var stemp;
	var idx1;
	var idx2;
	var aRe;
	var aIm;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return A;
	}

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( side === 'left' ) {
		// Apply rotations from the left (act on rows)
		if ( pivot === 'variable' ) {
			if ( direct === 'forward' ) {
				// Variable pivot, forward direction
				for ( j = 0; j < M - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < N; i++ ) {
							idx1 = oA + (( j + 1 ) * sa1) + (i * sa2);
							idx2 = oA + (j * sa1) + (i * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			} else {
				// Variable pivot, backward direction
				for ( j = M - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < N; i++ ) {
							idx1 = oA + (( j + 1 ) * sa1) + (i * sa2);
							idx2 = oA + (j * sa1) + (i * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			}
		} else if ( pivot === 'top' ) {
			if ( direct === 'forward' ) {
				for ( j = 1; j < M; j++ ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < N; i++ ) {
							idx1 = oA + (j * sa1) + (i * sa2);
							idx2 = oA + (i * sa2); // row 0
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			} else {
				for ( j = M - 1; j >= 1; j-- ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < N; i++ ) {
							idx1 = oA + (j * sa1) + (i * sa2);
							idx2 = oA + (i * sa2); // row 0
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			}
		} else if ( pivot === 'bottom' ) {
			if ( direct === 'forward' ) {
				for ( j = 0; j < M - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < N; i++ ) {
							idx1 = oA + (j * sa1) + (i * sa2);
							idx2 = oA + (( M - 1 ) * sa1) + (i * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (stemp * aRe) + (ctemp * tempRe);
							Av[ idx1 + 1 ] = (stemp * aIm) + (ctemp * tempIm);
							Av[ idx2 ] = (ctemp * aRe) - (stemp * tempRe);
							Av[ idx2 + 1 ] = (ctemp * aIm) - (stemp * tempIm);
						}
					}
				}
			} else {
				for ( j = M - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < N; i++ ) {
							idx1 = oA + (j * sa1) + (i * sa2);
							idx2 = oA + (( M - 1 ) * sa1) + (i * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (stemp * aRe) + (ctemp * tempRe);
							Av[ idx1 + 1 ] = (stemp * aIm) + (ctemp * tempIm);
							Av[ idx2 ] = (ctemp * aRe) - (stemp * tempRe);
							Av[ idx2 + 1 ] = (ctemp * aIm) - (stemp * tempIm);
						}
					}
				}
			}
		}
	} else if ( side === 'right' ) {
		// Apply rotations from the right (act on columns)
		if ( pivot === 'variable' ) {
			if ( direct === 'forward' ) {
				for ( j = 0; j < N - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							idx1 = oA + (i * sa1) + (( j + 1 ) * sa2);
							idx2 = oA + (i * sa1) + (j * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			} else {
				for ( j = N - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							idx1 = oA + (i * sa1) + (( j + 1 ) * sa2);
							idx2 = oA + (i * sa1) + (j * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			}
		} else if ( pivot === 'top' ) {
			if ( direct === 'forward' ) {
				for ( j = 1; j < N; j++ ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							idx1 = oA + (i * sa1) + (j * sa2);
							idx2 = oA + (i * sa1); // col 0
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			} else {
				for ( j = N - 1; j >= 1; j-- ) {
					ctemp = c[ offsetC + (( j - 1 ) * strideC) ];
					stemp = s[ offsetS + (( j - 1 ) * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							idx1 = oA + (i * sa1) + (j * sa2);
							idx2 = oA + (i * sa1); // col 0
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (ctemp * tempRe) - (stemp * aRe);
							Av[ idx1 + 1 ] = (ctemp * tempIm) - (stemp * aIm);
							Av[ idx2 ] = (stemp * tempRe) + (ctemp * aRe);
							Av[ idx2 + 1 ] = (stemp * tempIm) + (ctemp * aIm);
						}
					}
				}
			}
		} else if ( pivot === 'bottom' ) {
			if ( direct === 'forward' ) {
				for ( j = 0; j < N - 1; j++ ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							idx1 = oA + (i * sa1) + (j * sa2);
							idx2 = oA + (i * sa1) + (( N - 1 ) * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (stemp * aRe) + (ctemp * tempRe);
							Av[ idx1 + 1 ] = (stemp * aIm) + (ctemp * tempIm);
							Av[ idx2 ] = (ctemp * aRe) - (stemp * tempRe);
							Av[ idx2 + 1 ] = (ctemp * aIm) - (stemp * tempIm);
						}
					}
				}
			} else {
				for ( j = N - 2; j >= 0; j-- ) {
					ctemp = c[ offsetC + (j * strideC) ];
					stemp = s[ offsetS + (j * strideS) ];
					if ( ctemp !== 1.0 || stemp !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							idx1 = oA + (i * sa1) + (j * sa2);
							idx2 = oA + (i * sa1) + (( N - 1 ) * sa2);
							tempRe = Av[ idx1 ];
							tempIm = Av[ idx1 + 1 ];
							aRe = Av[ idx2 ];
							aIm = Av[ idx2 + 1 ];
							Av[ idx1 ] = (stemp * aRe) + (ctemp * tempRe);
							Av[ idx1 + 1 ] = (stemp * aIm) + (ctemp * tempIm);
							Av[ idx2 ] = (ctemp * aRe) - (stemp * tempRe);
							Av[ idx2 + 1 ] = (ctemp * aIm) - (stemp * tempIm);
						}
					}
				}
			}
		}
	}
	return A;
}


// EXPORTS //

export default zlasr;
