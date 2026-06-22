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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines, max-lines-per-function */

// MODULES //

import ddot from '../../../../blas/base/ddot/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlaln2 from '../../dlaln2/lib/base.js';
import dlasy2 from '../../dlasy2/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' );

// Scratch arrays for dlaln2 and dlasy2
var VEC = new Float64Array( 4 );  // 2x2 column-major
var X = new Float64Array( 4 );    // 2x2 column-major
var SCALOC_ARR = new Float64Array( 1 );
var XNORM_ARR = new Float64Array( 1 );
var DUM = new Float64Array( 1 );


// MAIN //

/**
* Solves the real Sylvester matrix equation:.
*
*   op(A) _ X + ISGN _ X _ op(B) = scale _ C
*
* where op(A) = A or A**T, A and B are upper quasi-triangular, and
* scale is an output scale factor set <= 1 to avoid overflow in X.
*
* @private
* @param {string} trana - `'no-transpose'` or `'transpose'` of A
* @param {string} tranb - `'no-transpose'` or `'transpose'` of B
* @param {integer} isgn - +1 or -1
* @param {NonNegativeInteger} M - number of rows in A and C
* @param {NonNegativeInteger} N - number of columns in B and C
* @param {Float64Array} A - M-by-M upper quasi-triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper quasi-triangular matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} C - M-by-N right-hand side, overwritten with solution X
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @returns {integer} info (0 = success, 1 = A and B have common or close eigenvalues)
*/
function dtrsyl( trana, tranb, isgn, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, scale ) {
	var notrna;
	var notrnb;
	var bignum;
	var scaloc;
	var smlnum;
	var lnext;
	var knext;
	var info;
	var suml;
	var sumr;
	var smin;
	var da11;
	var sgn;
	var a11;
	var res;
	var db;
	var k1;
	var k2;
	var l1;
	var l2;
	var k;
	var l;
	var j;

	notrna = ( trana === 'no-transpose' );
	notrnb = ( tranb === 'no-transpose' );

	info = 0;

	// Quick return
	scale[ 0 ] = ONE;
	if ( M === 0 || N === 0 ) {
		return info;
	}

	// Set up constants
	smlnum = SMLNUM * ( M * N ) / EPS;
	bignum = ONE / smlnum;

	smin = Math.max(smlnum, EPS * dlange( 'max', M, M, A, strideA1, strideA2, offsetA, DUM, 1, 0 ), EPS * dlange( 'max', N, N, B, strideB1, strideB2, offsetB, DUM, 1, 0 ));

	sgn = isgn;

	if ( notrna && notrnb ) {
		// Solve A*X + ISGN*X*B = scale*C
		// The (K,L) block is determined by back-substitution for:
		// Rows K..K2 and columns L..L2

		lnext = 0;
		for ( l = 0; l < N; l++ ) {
			if ( l < lnext ) {
				continue;
			}
			if ( l === N - 1 ) {
				l1 = l;
				l2 = l;
			} else if ( B[ offsetB + (l + 1) * strideB1 + l * strideB2 ] !== ZERO ) {
				l1 = l;
				l2 = l + 1;
				lnext = l + 2;
			} else {
				l1 = l;
				l2 = l;
				lnext = l + 1;
			}

			knext = M - 1;
			for ( k = M - 1; k >= 0; k-- ) {
				if ( k > knext ) {
					continue;
				}
				if ( k === 0 ) {
					k1 = k;
					k2 = k;
				} else if ( A[ offsetA + k * strideA1 + (k - 1) * strideA2 ] !== ZERO ) {
					k1 = k - 1;
					k2 = k;
					knext = k - 2;
				} else {
					k1 = k;
					k2 = k;
					knext = k - 1;
				}

				if ( l1 === l2 && k1 === k2 ) {
					suml = ddot( M - k1 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k1 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k1 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );
					scaloc = ONE;

					a11 = A[ offsetA + k1 * strideA1 + k1 * strideA2 ] + sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ];
					da11 = Math.abs( a11 );
					if ( da11 <= smin ) {
						a11 = smin;
						da11 = smin;
						info = 1;
					}
					db = Math.abs( VEC[ 0 ] );
					if ( da11 < ONE && db > ONE ) {
						if ( db > bignum * da11 ) {
							scaloc = ONE / db;
						}
					}
					X[ 0 ] = ( VEC[ 0 ] * scaloc ) / a11;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
				} else if ( l1 === l2 && k1 !== k2 ) {
					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k2 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k2 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					// VEC is 2x1 column-major: VEC[0]=row0, VEC[1]=row1
					res = dlaln2( false, 2, 1, smin, ONE, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, ONE, ONE, VEC, 1, 2, 0, -sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 === k2 ) {
					suml = ddot( M - k1 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k1 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k1 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = sgn * ( C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr ) );

					suml = ddot( M - k1 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k1 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k1 + 1, M - 1) * strideC1 + l2 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l2 * strideB2 );
					VEC[ 1 ] = sgn * ( C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr ) );

					res = dlaln2( true, 2, 1, smin, ONE, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, ONE, ONE, VEC, 1, 2, 0, -sgn * A[ offsetA + k1 * strideA1 + k1 * strideA2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 !== k2 ) {
					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l2 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l2 * strideB2 );
					VEC[ 2 ] = C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k2 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k2 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k2 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l2 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k2 * strideC1, B, strideB1, offsetB + l2 * strideB2 );
					VEC[ 3 ] = C[ offsetC + k2 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					// VEC is 2x2 column-major with stride 2
					dlasy2( false, false, isgn, 2, 2, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, VEC, 1, 2, 0, SCALOC_ARR, X, 1, 2, 0, XNORM_ARR );
					if ( SCALOC_ARR[ 0 ] !== ONE ) {
						info = 1;
					}
					scaloc = SCALOC_ARR[ 0 ];

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 2 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
					C[ offsetC + k2 * strideC1 + l2 * strideC2 ] = X[ 3 ];
				}
			}
		}
	} else if ( !notrna && notrnb ) {
		// Solve A**T*X + ISGN*X*B = scale*C
		// Rows forward, columns forward

		lnext = 0;
		for ( l = 0; l < N; l++ ) {
			if ( l < lnext ) {
				continue;
			}
			if ( l === N - 1 ) {
				l1 = l;
				l2 = l;
			} else if ( B[ offsetB + (l + 1) * strideB1 + l * strideB2 ] !== ZERO ) {
				l1 = l;
				l2 = l + 1;
				lnext = l + 2;
			} else {
				l1 = l;
				l2 = l;
				lnext = l + 1;
			}

			knext = 0;
			for ( k = 0; k < M; k++ ) {
				if ( k < knext ) {
					continue;
				}
				if ( k === M - 1 ) {
					k1 = k;
					k2 = k;
				} else if ( A[ offsetA + (k + 1) * strideA1 + k * strideA2 ] !== ZERO ) {
					k1 = k;
					k2 = k + 1;
					knext = k + 2;
				} else {
					k1 = k;
					k2 = k;
					knext = k + 1;
				}

				if ( l1 === l2 && k1 === k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );
					scaloc = ONE;

					a11 = A[ offsetA + k1 * strideA1 + k1 * strideA2 ] + sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ];
					da11 = Math.abs( a11 );
					if ( da11 <= smin ) {
						a11 = smin;
						da11 = smin;
						info = 1;
					}
					db = Math.abs( VEC[ 0 ] );
					if ( da11 < ONE && db > ONE ) {
						if ( db > bignum * da11 ) {
							scaloc = ONE / db;
						}
					}
					X[ 0 ] = ( VEC[ 0 ] * scaloc ) / a11;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
				} else if ( l1 === l2 && k1 !== k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k2 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k2 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					res = dlaln2( true, 2, 1, smin, ONE, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, ONE, ONE, VEC, 1, 2, 0, -sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 === k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = sgn * ( C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr ) );

					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l2 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l2 * strideB2 );
					VEC[ 1 ] = sgn * ( C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr ) );

					res = dlaln2( true, 2, 1, smin, ONE, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, ONE, ONE, VEC, 1, 2, 0, -sgn * A[ offsetA + k1 * strideA1 + k1 * strideA2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 !== k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l2 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k1 * strideC1, B, strideB1, offsetB + l2 * strideB2 );
					VEC[ 2 ] = C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k2 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k2 * strideC1, B, strideB1, offsetB + l1 * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k2 * strideA2, C, strideC1, offsetC + l2 * strideC2 );
					sumr = ddot( l1, C, strideC2, offsetC + k2 * strideC1, B, strideB1, offsetB + l2 * strideB2 );
					VEC[ 3 ] = C[ offsetC + k2 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					dlasy2( true, false, isgn, 2, 2, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, VEC, 1, 2, 0, SCALOC_ARR, X, 1, 2, 0, XNORM_ARR );
					if ( SCALOC_ARR[ 0 ] !== ONE ) {
						info = 1;
					}
					scaloc = SCALOC_ARR[ 0 ];

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 2 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
					C[ offsetC + k2 * strideC1 + l2 * strideC2 ] = X[ 3 ];
				}
			}
		}
	} else if ( !notrna && !notrnb ) {
		// Solve A**T*X + ISGN*X*B**T = scale*C
		// Rows forward, columns backward

		lnext = N - 1;
		for ( l = N - 1; l >= 0; l-- ) {
			if ( l > lnext ) {
				continue;
			}
			if ( l === 0 ) {
				l1 = l;
				l2 = l;
			} else if ( B[ offsetB + l * strideB1 + (l - 1) * strideB2 ] !== ZERO ) {
				l1 = l - 1;
				l2 = l;
				lnext = l - 2;
			} else {
				l1 = l;
				l2 = l;
				lnext = l - 1;
			}

			knext = 0;
			for ( k = 0; k < M; k++ ) {
				if ( k < knext ) {
					continue;
				}
				if ( k === M - 1 ) {
					k1 = k;
					k2 = k;
				} else if ( A[ offsetA + (k + 1) * strideA1 + k * strideA2 ] !== ZERO ) {
					k1 = k;
					k2 = k + 1;
					knext = k + 2;
				} else {
					k1 = k;
					k2 = k;
					knext = k + 1;
				}

				if ( l1 === l2 && k1 === k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( N - l1 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l1 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l1 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );
					scaloc = ONE;

					a11 = A[ offsetA + k1 * strideA1 + k1 * strideA2 ] + sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ];
					da11 = Math.abs( a11 );
					if ( da11 <= smin ) {
						a11 = smin;
						da11 = smin;
						info = 1;
					}
					db = Math.abs( VEC[ 0 ] );
					if ( da11 < ONE && db > ONE ) {
						if ( db > bignum * da11 ) {
							scaloc = ONE / db;
						}
					}
					X[ 0 ] = ( VEC[ 0 ] * scaloc ) / a11;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
				} else if ( l1 === l2 && k1 !== k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k2 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k2 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					res = dlaln2( true, 2, 1, smin, ONE, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, ONE, ONE, VEC, 1, 2, 0, -sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 === k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = sgn * ( C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr ) );

					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l2 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l2 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 1 ] = sgn * ( C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr ) );

					res = dlaln2( false, 2, 1, smin, ONE, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, ONE, ONE, VEC, 1, 2, 0, -sgn * A[ offsetA + k1 * strideA1 + k1 * strideA2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 !== k2 ) {
					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k1 * strideA2, C, strideC1, offsetC + l2 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l2 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 2 ] = C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k2 * strideA2, C, strideC1, offsetC + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k2 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( k1, A, strideA1, offsetA + k2 * strideA2, C, strideC1, offsetC + l2 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k2 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l2 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 3 ] = C[ offsetC + k2 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					dlasy2( true, true, isgn, 2, 2, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, VEC, 1, 2, 0, SCALOC_ARR, X, 1, 2, 0, XNORM_ARR );
					if ( SCALOC_ARR[ 0 ] !== ONE ) {
						info = 1;
					}
					scaloc = SCALOC_ARR[ 0 ];

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 2 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
					C[ offsetC + k2 * strideC1 + l2 * strideC2 ] = X[ 3 ];
				}
			}
		}
	} else if ( notrna && !notrnb ) {
		// Solve A*X + ISGN*X*B**T = scale*C
		// Rows backward, columns backward

		lnext = N - 1;
		for ( l = N - 1; l >= 0; l-- ) {
			if ( l > lnext ) {
				continue;
			}
			if ( l === 0 ) {
				l1 = l;
				l2 = l;
			} else if ( B[ offsetB + l * strideB1 + (l - 1) * strideB2 ] !== ZERO ) {
				l1 = l - 1;
				l2 = l;
				lnext = l - 2;
			} else {
				l1 = l;
				l2 = l;
				lnext = l - 1;
			}

			knext = M - 1;
			for ( k = M - 1; k >= 0; k-- ) {
				if ( k > knext ) {
					continue;
				}
				if ( k === 0 ) {
					k1 = k;
					k2 = k;
				} else if ( A[ offsetA + k * strideA1 + (k - 1) * strideA2 ] !== ZERO ) {
					k1 = k - 1;
					k2 = k;
					knext = k - 2;
				} else {
					k1 = k;
					k2 = k;
					knext = k - 1;
				}

				if ( l1 === l2 && k1 === k2 ) {
					suml = ddot( M - k1 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k1 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k1 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( N - l1 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l1 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l1 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );
					scaloc = ONE;

					a11 = A[ offsetA + k1 * strideA1 + k1 * strideA2 ] + sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ];
					da11 = Math.abs( a11 );
					if ( da11 <= smin ) {
						a11 = smin;
						da11 = smin;
						info = 1;
					}
					db = Math.abs( VEC[ 0 ] );
					if ( da11 < ONE && db > ONE ) {
						if ( db > bignum * da11 ) {
							scaloc = ONE / db;
						}
					}
					X[ 0 ] = ( VEC[ 0 ] * scaloc ) / a11;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
				} else if ( l1 === l2 && k1 !== k2 ) {
					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k2 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k2 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					res = dlaln2( false, 2, 1, smin, ONE, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, ONE, ONE, VEC, 1, 2, 0, -sgn * B[ offsetB + l1 * strideB1 + l1 * strideB2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 === k2 ) {
					suml = ddot( M - k1 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k1 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k1 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = sgn * ( C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr ) );

					suml = ddot( M - k1 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k1 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k1 + 1, M - 1) * strideC1 + l2 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l2 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 1 ] = sgn * ( C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr ) );

					res = dlaln2( false, 2, 1, smin, ONE, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, ONE, ONE, VEC, 1, 2, 0, -sgn * A[ offsetA + k1 * strideA1 + k1 * strideA2 ], ZERO, X, 1, 2, 0 );
					if ( res.info !== 0 ) {
						info = 1;
					}
					scaloc = res.scale;

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 1 ];
				} else if ( l1 !== l2 && k1 !== k2 ) {
					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 0 ] = C[ offsetC + k1 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k1 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l2 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k1 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l2 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 2 ] = C[ offsetC + k1 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k2 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l1 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k2 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l1 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 1 ] = C[ offsetC + k2 * strideC1 + l1 * strideC2 ] - ( suml + sgn * sumr );

					suml = ddot( M - k2 - 1, A, strideA2, offsetA + k2 * strideA1 + Math.min(k2 + 1, M - 1) * strideA2, C, strideC1, offsetC + Math.min(k2 + 1, M - 1) * strideC1 + l2 * strideC2 );
					sumr = ddot( N - l2 - 1, C, strideC2, offsetC + k2 * strideC1 + Math.min(l2 + 1, N - 1) * strideC2, B, strideB2, offsetB + l2 * strideB1 + Math.min(l2 + 1, N - 1) * strideB2 );
					VEC[ 3 ] = C[ offsetC + k2 * strideC1 + l2 * strideC2 ] - ( suml + sgn * sumr );

					dlasy2( false, true, isgn, 2, 2, A, strideA1, strideA2, offsetA + k1 * strideA1 + k1 * strideA2, B, strideB1, strideB2, offsetB + l1 * strideB1 + l1 * strideB2, VEC, 1, 2, 0, SCALOC_ARR, X, 1, 2, 0, XNORM_ARR );
					if ( SCALOC_ARR[ 0 ] !== ONE ) {
						info = 1;
					}
					scaloc = SCALOC_ARR[ 0 ];

					if ( scaloc !== ONE ) {
						for ( j = 0; j < N; j++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
						}
						scale[ 0 ] *= scaloc;
					}
					C[ offsetC + k1 * strideC1 + l1 * strideC2 ] = X[ 0 ];
					C[ offsetC + k1 * strideC1 + l2 * strideC2 ] = X[ 2 ];
					C[ offsetC + k2 * strideC1 + l1 * strideC2 ] = X[ 1 ];
					C[ offsetC + k2 * strideC1 + l2 * strideC2 ] = X[ 3 ];
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default dtrsyl;
