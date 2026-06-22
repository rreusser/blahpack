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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zdotu from '../../../../blas/base/zdotu/lib/base.js';
import zladiv from '../../zladiv/lib/base.js';


// VARIABLES //

var ONE = 1.0;
var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' );
var DUM = new Float64Array( 1 );

// Scratch Complex128Array buffers for zladiv calls:
var ZLADIV_X = new Complex128Array( 1 );
var ZLADIV_Y = new Complex128Array( 1 );
var ZLADIV_OUT = new Complex128Array( 1 );
var ZLADIV_Xv = reinterpret( ZLADIV_X, 0 );
var ZLADIV_Yv = reinterpret( ZLADIV_Y, 0 );
var ZLADIV_OUTv = reinterpret( ZLADIV_OUT, 0 );


// MAIN //

/**
* Solves the complex Sylvester matrix equation:
*
*   op(A)*X + X*op(B) = scale*C  (when isgn = +1)
*   op(A)*X - X*op(B) = scale*C  (when isgn = -1)
*
* where op(A) = A or A**H, and A and B are both upper triangular. A is
* M-by-M and B is N-by-N; the right hand side C and the solution X are
* M-by-N; and scale is an output scale factor, set <= 1 to avoid overflow.
*
* @private
* @param {string} trana - `'no-transpose'` or `'conjugate-transpose'` of A
* @param {string} tranb - `'no-transpose'` or `'conjugate-transpose'` of B
* @param {integer} isgn - +1 or -1
* @param {NonNegativeInteger} M - order of matrix A, rows of C
* @param {NonNegativeInteger} N - order of matrix B, columns of C
* @param {Complex128Array} A - upper triangular matrix A (M-by-M)
* @param {integer} strideA1 - stride of first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - upper triangular matrix B (N-by-N)
* @param {integer} strideB1 - stride of first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} C - M-by-N right hand side, overwritten with solution X
* @param {integer} strideC1 - stride of first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Float64Array} scale - output: scale[0] = scaling factor
* @returns {integer} info (0 = success, 1 = perturbed)
*/
function ztrsyl( trana, tranb, isgn, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, scale ) {
	var notrna;
	var notrnb;
	var bignum;
	var smlnum;
	var scaloc;
	var info;
	var smin;
	var suml;
	var sumr;
	var da11;
	var db;
	var sgn;
	var vec;
	var av;
	var bv;
	var cv;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var oA;
	var oB;
	var oC;
	var j;
	var k;
	var l;
	var vr;
	var vi;
	var xr;
	var xi;
	var ar;
	var ai;

	notrna = ( trana === 'no-transpose' );
	notrnb = ( tranb === 'no-transpose' );

	info = 0;
	scale[ 0 ] = ONE;

	// Quick return
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Set constants
	smlnum = SMLNUM * ( M * N ) / EPS;
	bignum = ONE / smlnum;
	smin = Math.max( smlnum, EPS * zlange( 'max', M, M, A, strideA1, strideA2, offsetA, DUM, 1, 0 ), EPS * zlange( 'max', N, N, B, strideB1, strideB2, offsetB, DUM, 1, 0 ) );
	sgn = isgn;

	av = reinterpret( A, 0 );
	bv = reinterpret( B, 0 );
	cv = reinterpret( C, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oC = offsetC * 2;

	if ( notrna && notrnb ) {
		// Solve A*X + ISGN*X*B = scale*C
		for ( l = 0; l < N; l++ ) {
			for ( k = M - 1; k >= 0; k-- ) {
				// SUML = ZDOTU( M-K-1, A(K, K+1), LDA, C(K+1, L), 1 )
				suml = zdotu( M - k - 1, A, strideA2, offsetA + k * strideA1 + ( k + 1 ) * strideA2, C, strideC1, offsetC + ( k + 1 ) * strideC1 + l * strideC2 );
				// SUMR = ZDOTU( L, C(K, 0), LDC, B(0, L), 1 )
				sumr = zdotu( l, C, strideC2, offsetC + k * strideC1, B, strideB1, offsetB + l * strideB2 );

				// VEC = C(K,L) - (SUML + SGN*SUMR)
				vr = cv[ oC + k * sc1 + l * sc2 ] - ( suml.re + sgn * sumr.re );
				vi = cv[ oC + k * sc1 + l * sc2 + 1 ] - ( suml.im + sgn * sumr.im );

				scaloc = ONE;
				// A11 = A(K,K) + SGN*B(L,L)
				ar = av[ oA + k * sa1 + k * sa2 ] + sgn * bv[ oB + l * sb1 + l * sb2 ];
				ai = av[ oA + k * sa1 + k * sa2 + 1 ] + sgn * bv[ oB + l * sb1 + l * sb2 + 1 ];
				da11 = Math.abs( ar ) + Math.abs( ai );
				if ( da11 <= smin ) {
					ar = smin;
					ai = 0.0;
					da11 = smin;
					info = 1;
				}
				db = Math.abs( vr ) + Math.abs( vi );
				if ( da11 < ONE && db > ONE ) {
					if ( db > bignum * da11 ) {
						scaloc = ONE / db;
					}
				}

				// X11 = ZLADIV( VEC * SCALOC, A11 )
				ZLADIV_Xv[ 0 ] = vr * scaloc;
				ZLADIV_Xv[ 1 ] = vi * scaloc;
				ZLADIV_Yv[ 0 ] = ar;
				ZLADIV_Yv[ 1 ] = ai;
				zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );

				if ( scaloc !== ONE ) {
					for ( j = 0; j < N; j++ ) {
						zdscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
					}
					scale[ 0 ] *= scaloc;
				}
				cv[ oC + k * sc1 + l * sc2 ] = ZLADIV_OUTv[ 0 ];
				cv[ oC + k * sc1 + l * sc2 + 1 ] = ZLADIV_OUTv[ 1 ];
			}
		}
	} else if ( !notrna && notrnb ) {
		// Solve A**H*X + ISGN*X*B = scale*C
		for ( l = 0; l < N; l++ ) {
			for ( k = 0; k < M; k++ ) {
				// SUML = ZDOTC( K, A(0,K), 1, C(0,L), 1 )
				suml = zdotc( k, A, strideA1, offsetA + k * strideA2, C, strideC1, offsetC + l * strideC2 );
				// SUMR = ZDOTU( L, C(K, 0), LDC, B(0, L), 1 )
				sumr = zdotu( l, C, strideC2, offsetC + k * strideC1, B, strideB1, offsetB + l * strideB2 );

				vr = cv[ oC + k * sc1 + l * sc2 ] - ( suml.re + sgn * sumr.re );
				vi = cv[ oC + k * sc1 + l * sc2 + 1 ] - ( suml.im + sgn * sumr.im );

				scaloc = ONE;
				// A11 = CONJG(A(K,K)) + SGN*B(L,L)
				ar = av[ oA + k * sa1 + k * sa2 ];
				ai = -av[ oA + k * sa1 + k * sa2 + 1 ]; // conjugate
				ar += sgn * bv[ oB + l * sb1 + l * sb2 ];
				ai += sgn * bv[ oB + l * sb1 + l * sb2 + 1 ];
				da11 = Math.abs( ar ) + Math.abs( ai );
				if ( da11 <= smin ) {
					ar = smin;
					ai = 0.0;
					da11 = smin;
					info = 1;
				}
				db = Math.abs( vr ) + Math.abs( vi );
				if ( da11 < ONE && db > ONE ) {
					if ( db > bignum * da11 ) {
						scaloc = ONE / db;
					}
				}

				ZLADIV_Xv[ 0 ] = vr * scaloc;
				ZLADIV_Xv[ 1 ] = vi * scaloc;
				ZLADIV_Yv[ 0 ] = ar;
				ZLADIV_Yv[ 1 ] = ai;
				zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );

				if ( scaloc !== ONE ) {
					for ( j = 0; j < N; j++ ) {
						zdscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
					}
					scale[ 0 ] *= scaloc;
				}
				cv[ oC + k * sc1 + l * sc2 ] = ZLADIV_OUTv[ 0 ];
				cv[ oC + k * sc1 + l * sc2 + 1 ] = ZLADIV_OUTv[ 1 ];
			}
		}
	} else if ( !notrna && !notrnb ) {
		// Solve A**H*X + ISGN*X*B**H = C
		for ( l = N - 1; l >= 0; l-- ) {
			for ( k = 0; k < M; k++ ) {
				// SUML = ZDOTC( K, A(0,K), 1, C(0,L), 1 )
				suml = zdotc( k, A, strideA1, offsetA + k * strideA2, C, strideC1, offsetC + l * strideC2 );
				// SUMR = ZDOTC( N-L-1, C(K, L+1), LDC, B(L, L+1), LDB )
				sumr = zdotc( N - l - 1, C, strideC2, offsetC + k * strideC1 + ( l + 1 ) * strideC2, B, strideB2, offsetB + l * strideB1 + ( l + 1 ) * strideB2 );

				// VEC = C(K,L) - (SUML + SGN*CONJG(SUMR))
				vr = cv[ oC + k * sc1 + l * sc2 ] - ( suml.re + sgn * sumr.re );
				vi = cv[ oC + k * sc1 + l * sc2 + 1 ] - ( suml.im + sgn * ( -sumr.im ) );

				scaloc = ONE;
				// A11 = CONJG( A(K,K) + SGN*B(L,L) )
				ar = av[ oA + k * sa1 + k * sa2 ] + sgn * bv[ oB + l * sb1 + l * sb2 ];
				ai = av[ oA + k * sa1 + k * sa2 + 1 ] + sgn * bv[ oB + l * sb1 + l * sb2 + 1 ];
				// conjugate
				ai = -ai;
				ar = ar; // eslint-disable-line no-self-assign
				da11 = Math.abs( ar ) + Math.abs( ai );
				if ( da11 <= smin ) {
					ar = smin;
					ai = 0.0;
					da11 = smin;
					info = 1;
				}
				db = Math.abs( vr ) + Math.abs( vi );
				if ( da11 < ONE && db > ONE ) {
					if ( db > bignum * da11 ) {
						scaloc = ONE / db;
					}
				}

				ZLADIV_Xv[ 0 ] = vr * scaloc;
				ZLADIV_Xv[ 1 ] = vi * scaloc;
				ZLADIV_Yv[ 0 ] = ar;
				ZLADIV_Yv[ 1 ] = ai;
				zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );

				if ( scaloc !== ONE ) {
					for ( j = 0; j < N; j++ ) {
						zdscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
					}
					scale[ 0 ] *= scaloc;
				}
				cv[ oC + k * sc1 + l * sc2 ] = ZLADIV_OUTv[ 0 ];
				cv[ oC + k * sc1 + l * sc2 + 1 ] = ZLADIV_OUTv[ 1 ];
			}
		}
	} else if ( notrna && !notrnb ) {
		// Solve A*X + ISGN*X*B**H = C
		for ( l = N - 1; l >= 0; l-- ) {
			for ( k = M - 1; k >= 0; k-- ) {
				// SUML = ZDOTU( M-K-1, A(K, K+1), LDA, C(K+1, L), 1 )
				suml = zdotu( M - k - 1, A, strideA2, offsetA + k * strideA1 + ( k + 1 ) * strideA2, C, strideC1, offsetC + ( k + 1 ) * strideC1 + l * strideC2 );
				// SUMR = ZDOTC( N-L-1, C(K, L+1), LDC, B(L, L+1), LDB )
				sumr = zdotc( N - l - 1, C, strideC2, offsetC + k * strideC1 + ( l + 1 ) * strideC2, B, strideB2, offsetB + l * strideB1 + ( l + 1 ) * strideB2 );

				// VEC = C(K,L) - (SUML + SGN*CONJG(SUMR))
				vr = cv[ oC + k * sc1 + l * sc2 ] - ( suml.re + sgn * sumr.re );
				vi = cv[ oC + k * sc1 + l * sc2 + 1 ] - ( suml.im + sgn * ( -sumr.im ) );

				scaloc = ONE;
				// A11 = A(K,K) + SGN*CONJG(B(L,L))
				ar = av[ oA + k * sa1 + k * sa2 ] + sgn * bv[ oB + l * sb1 + l * sb2 ];
				ai = av[ oA + k * sa1 + k * sa2 + 1 ] + sgn * ( -bv[ oB + l * sb1 + l * sb2 + 1 ] );
				da11 = Math.abs( ar ) + Math.abs( ai );
				if ( da11 <= smin ) {
					ar = smin;
					ai = 0.0;
					da11 = smin;
					info = 1;
				}
				db = Math.abs( vr ) + Math.abs( vi );
				if ( da11 < ONE && db > ONE ) {
					if ( db > bignum * da11 ) {
						scaloc = ONE / db;
					}
				}

				ZLADIV_Xv[ 0 ] = vr * scaloc;
				ZLADIV_Xv[ 1 ] = vi * scaloc;
				ZLADIV_Yv[ 0 ] = ar;
				ZLADIV_Yv[ 1 ] = ai;
				zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );

				if ( scaloc !== ONE ) {
					for ( j = 0; j < N; j++ ) {
						zdscal( M, scaloc, C, strideC1, offsetC + j * strideC2 );
					}
					scale[ 0 ] *= scaloc;
				}
				cv[ oC + k * sc1 + l * sc2 ] = ZLADIV_OUTv[ 0 ];
				cv[ oC + k * sc1 + l * sc2 + 1 ] = ZLADIV_OUTv[ 1 ];
			}
		}
	}

	return info;
}


// EXPORTS //

export default ztrsyl;
