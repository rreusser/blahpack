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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );
var ZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Applies a complex triangular-pentagonal block reflector H or its conjugate-transpose H^H to a complex M-by-N matrix C, from either the left or the right.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - number of rows of A and B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} K - order of the matrix T (number of elementary reflectors)
* @param {NonNegativeInteger} l - number of rows of the trapezoidal part of V
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - first dim stride of V (in complex elements)
* @param {integer} strideV2 - second dim stride of V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - triangular factor
* @param {integer} strideT1 - first dim stride of T (in complex elements)
* @param {integer} strideT2 - second dim stride of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} A - matrix A, modified in-place
* @param {integer} strideA1 - first dim stride of A (in complex elements)
* @param {integer} strideA2 - second dim stride of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - matrix B, modified in-place
* @param {integer} strideB1 - first dim stride of B (in complex elements)
* @param {integer} strideB2 - second dim stride of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} WORK - workspace matrix
* @param {integer} strideWork1 - first dim stride of WORK (in complex elements)
* @param {integer} strideWork2 - second dim stride of WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
*/
function ztprfb( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork1, strideWork2, offsetWork ) {
	var forward;
	var column;
	var left;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sw1;
	var sw2;
	var Av;
	var Bv;
	var Wv;
	var mp;
	var np;
	var kp;
	var oA;
	var oB;
	var oW;
	var i;
	var j;

	if ( M <= 0 || N <= 0 || K <= 0 || l < 0 ) {
		return;
	}

	column = ( storev === 'columnwise' );
	forward = ( direct === 'forward' );
	left = ( side === 'left' );

	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Wv = reinterpret( WORK, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sw1 = strideWork1 * 2;
	sw2 = strideWork2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oW = offsetWork * 2;

	if ( column && forward && left ) {
		mp = ( M - l + 1 < M ) ? M - l + 1 : M;
		kp = ( l + 1 < K ) ? l + 1 : K;

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] = Bv[ oB + ((M-l+i)*sb1) + (j*sb2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] = Bv[ oB + ((M-l+i)*sb1) + (j*sb2) + 1 ];
			}
		}
		ztrmm( 'left', 'upper', 'conjugate-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'conjugate-transpose', 'no-transpose', l, N, M-l, ONE, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, ONE, WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'conjugate-transpose', 'no-transpose', K-l, N, M, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV2), B, strideB1, strideB2, offsetB, ZERO, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'left', 'upper', trans, 'non-unit', K, N, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'no-transpose', 'no-transpose', M-l, N, K, NEGONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB );
		zgemm( 'no-transpose', 'no-transpose', l, N, K-l, NEGONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV1) + ((kp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1), ONE, B, strideB1, strideB2, offsetB + ((mp-1)*strideB1) );
		ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Bv[ oB + ((M-l+i)*sb1) + (j*sb2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Bv[ oB + ((M-l+i)*sb1) + (j*sb2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}
		return;
	}

	if ( column && forward && !left ) {
		np = ( N - l + 1 < N ) ? N - l + 1 : N;
		kp = ( l + 1 < K ) ? l + 1 : K;

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] = Bv[ oB + (i*sb1) + ((N-l+j)*sb2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] = Bv[ oB + (i*sb1) + ((N-l+j)*sb2) + 1 ];
			}
		}
		ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((np-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'no-transpose', 'no-transpose', M, l, N-l, ONE, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, ONE, WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'no-transpose', 'no-transpose', M, K-l, N, ONE, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV + ((kp-1)*strideV2), ZERO, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'right', 'upper', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'no-transpose', 'conjugate-transpose', M, N-l, K, NEGONE, WORK, strideWork1, strideWork2, offsetWork, V, strideV1, strideV2, offsetV, ONE, B, strideB1, strideB2, offsetB );
		zgemm( 'no-transpose', 'conjugate-transpose', M, l, K-l, NEGONE, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2), V, strideV1, strideV2, offsetV + ((np-1)*strideV1) + ((kp-1)*strideV2), ONE, B, strideB1, strideB2, offsetB + ((np-1)*strideB2) );
		ztrmm( 'right', 'upper', 'conjugate-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((np-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Bv[ oB + (i*sb1) + ((N-l+j)*sb2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Bv[ oB + (i*sb1) + ((N-l+j)*sb2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}
		return;
	}

	if ( column && !forward && left ) {
		mp = ( l + 1 < M ) ? l + 1 : M;
		kp = ( K - l + 1 < K ) ? K - l + 1 : K;

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Wv[ oW + ((K-l+i)*sw1) + (j*sw2) ] = Bv[ oB + (i*sb1) + (j*sb2) ];
				Wv[ oW + ((K-l+i)*sw1) + (j*sw2) + 1 ] = Bv[ oB + (i*sb1) + (j*sb2) + 1 ];
			}
		}

		ztrmm( 'left', 'lower', 'conjugate-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );
		zgemm( 'conjugate-transpose', 'no-transpose', l, N, M-l, ONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV1) + ((kp-1)*strideV2), B, strideB1, strideB2, offsetB + ((mp-1)*strideB1), ONE, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );
		zgemm( 'conjugate-transpose', 'no-transpose', K-l, N, M, ONE, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, ZERO, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'left', 'lower', trans, 'non-unit', K, N, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'no-transpose', 'no-transpose', M-l, N, K, NEGONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB + ((mp-1)*strideB1) );
		zgemm( 'no-transpose', 'no-transpose', l, N, K-l, NEGONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB );
		ztrmm( 'left', 'lower', 'no-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Bv[ oB + (i*sb1) + (j*sb2) ] -= Wv[ oW + ((K-l+i)*sw1) + (j*sw2) ];
				Bv[ oB + (i*sb1) + (j*sb2) + 1 ] -= Wv[ oW + ((K-l+i)*sw1) + (j*sw2) + 1 ];
			}
		}
		return;
	}

	if ( column && !forward && !left ) {
		np = ( l + 1 < N ) ? l + 1 : N;
		kp = ( K - l + 1 < K ) ? K - l + 1 : K;

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Wv[ oW + (i*sw1) + ((K-l+j)*sw2) ] = Bv[ oB + (i*sb1) + (j*sb2) ];
				Wv[ oW + (i*sw1) + ((K-l+j)*sw2) + 1 ] = Bv[ oB + (i*sb1) + (j*sb2) + 1 ];
			}
		}
		ztrmm( 'right', 'lower', 'no-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );
		zgemm( 'no-transpose', 'no-transpose', M, l, N-l, ONE, B, strideB1, strideB2, offsetB + ((np-1)*strideB2), V, strideV1, strideV2, offsetV + ((np-1)*strideV1) + ((kp-1)*strideV2), ONE, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );
		zgemm( 'no-transpose', 'no-transpose', M, K-l, N, ONE, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, ZERO, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'right', 'lower', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'no-transpose', 'conjugate-transpose', M, N-l, K, NEGONE, WORK, strideWork1, strideWork2, offsetWork, V, strideV1, strideV2, offsetV + ((np-1)*strideV1), ONE, B, strideB1, strideB2, offsetB + ((np-1)*strideB2) );
		zgemm( 'no-transpose', 'conjugate-transpose', M, l, K-l, NEGONE, WORK, strideWork1, strideWork2, offsetWork, V, strideV1, strideV2, offsetV, ONE, B, strideB1, strideB2, offsetB );
		ztrmm( 'right', 'lower', 'conjugate-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Bv[ oB + (i*sb1) + (j*sb2) ] -= Wv[ oW + (i*sw1) + ((K-l+j)*sw2) ];
				Bv[ oB + (i*sb1) + (j*sb2) + 1 ] -= Wv[ oW + (i*sw1) + ((K-l+j)*sw2) + 1 ];
			}
		}
		return;
	}

	if ( !column && forward && left ) {
		mp = ( M - l + 1 < M ) ? M - l + 1 : M;
		kp = ( l + 1 < K ) ? l + 1 : K;

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] = Bv[ oB + ((M-l+i)*sb1) + (j*sb2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] = Bv[ oB + ((M-l+i)*sb1) + (j*sb2) + 1 ];
			}
		}
		ztrmm( 'left', 'lower', 'no-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'no-transpose', 'no-transpose', l, N, M-l, ONE, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, ONE, WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'no-transpose', 'no-transpose', K-l, N, M, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1), B, strideB1, strideB2, offsetB, ZERO, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'left', 'upper', trans, 'non-unit', K, N, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'conjugate-transpose', 'no-transpose', M-l, N, K, NEGONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB );
		zgemm( 'conjugate-transpose', 'no-transpose', l, N, K-l, NEGONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1) + ((mp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1), ONE, B, strideB1, strideB2, offsetB + ((mp-1)*strideB1) );
		ztrmm( 'left', 'lower', 'conjugate-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Bv[ oB + ((M-l+i)*sb1) + (j*sb2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Bv[ oB + ((M-l+i)*sb1) + (j*sb2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}
		return;
	}

	if ( !column && forward && !left ) {
		np = ( N - l + 1 < N ) ? N - l + 1 : N;
		kp = ( l + 1 < K ) ? l + 1 : K;

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] = Bv[ oB + (i*sb1) + ((N-l+j)*sb2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] = Bv[ oB + (i*sb1) + ((N-l+j)*sb2) + 1 ];
			}
		}
		ztrmm( 'right', 'lower', 'conjugate-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((np-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'no-transpose', 'conjugate-transpose', M, l, N-l, ONE, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, ONE, WORK, strideWork1, strideWork2, offsetWork );
		zgemm( 'no-transpose', 'conjugate-transpose', M, K-l, N, ONE, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1), ZERO, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'right', 'upper', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'no-transpose', 'no-transpose', M, N-l, K, NEGONE, WORK, strideWork1, strideWork2, offsetWork, V, strideV1, strideV2, offsetV, ONE, B, strideB1, strideB2, offsetB );
		zgemm( 'no-transpose', 'no-transpose', M, l, K-l, NEGONE, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2), V, strideV1, strideV2, offsetV + ((kp-1)*strideV1) + ((np-1)*strideV2), ONE, B, strideB1, strideB2, offsetB + ((np-1)*strideB2) );
		ztrmm( 'right', 'lower', 'no-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((np-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < l; j++ ) {
			for ( i = 0; i < M; i++ ) {
				Bv[ oB + (i*sb1) + ((N-l+j)*sb2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Bv[ oB + (i*sb1) + ((N-l+j)*sb2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}
		return;
	}

	if ( !column && !forward && left ) {
		mp = ( l + 1 < M ) ? l + 1 : M;
		kp = ( K - l + 1 < K ) ? K - l + 1 : K;

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Wv[ oW + ((K-l+i)*sw1) + (j*sw2) ] = Bv[ oB + (i*sb1) + (j*sb2) ];
				Wv[ oW + ((K-l+i)*sw1) + (j*sw2) + 1 ] = Bv[ oB + (i*sb1) + (j*sb2) + 1 ];
			}
		}
		ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );
		zgemm( 'no-transpose', 'no-transpose', l, N, M-l, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1) + ((mp-1)*strideV2), B, strideB1, strideB2, offsetB + ((mp-1)*strideB1), ONE, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );
		zgemm( 'no-transpose', 'no-transpose', K-l, N, M, ONE, V, strideV1, strideV2, offsetV, B, strideB1, strideB2, offsetB, ZERO, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
				Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
			}
		}

		ztrmm( 'left', 'lower', trans, 'non-unit', K, N, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
				Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
			}
		}

		zgemm( 'conjugate-transpose', 'no-transpose', M-l, N, K, NEGONE, V, strideV1, strideV2, offsetV + ((mp-1)*strideV2), WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB + ((mp-1)*strideB1) );
		zgemm( 'conjugate-transpose', 'no-transpose', l, N, K-l, NEGONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork, ONE, B, strideB1, strideB2, offsetB );
		ztrmm( 'left', 'upper', 'conjugate-transpose', 'non-unit', l, N, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork1) );

		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < l; i++ ) {
				Bv[ oB + (i*sb1) + (j*sb2) ] -= Wv[ oW + ((K-l+i)*sw1) + (j*sw2) ];
				Bv[ oB + (i*sb1) + (j*sb2) + 1 ] -= Wv[ oW + ((K-l+i)*sw1) + (j*sw2) + 1 ];
			}
		}
		return;
	}

	// !column && !forward && !left
	np = ( l + 1 < N ) ? l + 1 : N;
	kp = ( K - l + 1 < K ) ? K - l + 1 : K;

	for ( j = 0; j < l; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Wv[ oW + (i*sw1) + ((K-l+j)*sw2) ] = Bv[ oB + (i*sb1) + (j*sb2) ];
			Wv[ oW + (i*sw1) + ((K-l+j)*sw2) + 1 ] = Bv[ oB + (i*sb1) + (j*sb2) + 1 ];
		}
	}
	ztrmm( 'right', 'upper', 'conjugate-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );
	zgemm( 'no-transpose', 'conjugate-transpose', M, l, N-l, ONE, B, strideB1, strideB2, offsetB + ((np-1)*strideB2), V, strideV1, strideV2, offsetV + ((kp-1)*strideV1) + ((np-1)*strideV2), ONE, WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );
	zgemm( 'no-transpose', 'conjugate-transpose', M, K-l, N, ONE, B, strideB1, strideB2, offsetB, V, strideV1, strideV2, offsetV, ZERO, WORK, strideWork1, strideWork2, offsetWork );

	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Wv[ oW + (i*sw1) + (j*sw2) ] += Av[ oA + (i*sa1) + (j*sa2) ];
			Wv[ oW + (i*sw1) + (j*sw2) + 1 ] += Av[ oA + (i*sa1) + (j*sa2) + 1 ];
		}
	}

	ztrmm( 'right', 'lower', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ oA + (i*sa1) + (j*sa2) ] -= Wv[ oW + (i*sw1) + (j*sw2) ];
			Av[ oA + (i*sa1) + (j*sa2) + 1 ] -= Wv[ oW + (i*sw1) + (j*sw2) + 1 ];
		}
	}

	zgemm( 'no-transpose', 'no-transpose', M, N-l, K, NEGONE, WORK, strideWork1, strideWork2, offsetWork, V, strideV1, strideV2, offsetV + ((np-1)*strideV2), ONE, B, strideB1, strideB2, offsetB + ((np-1)*strideB2) );
	zgemm( 'no-transpose', 'no-transpose', M, l, K-l, NEGONE, WORK, strideWork1, strideWork2, offsetWork, V, strideV1, strideV2, offsetV, ONE, B, strideB1, strideB2, offsetB );
	ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', M, l, ONE, V, strideV1, strideV2, offsetV + ((kp-1)*strideV1), WORK, strideWork1, strideWork2, offsetWork + ((kp-1)*strideWork2) );

	for ( j = 0; j < l; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Bv[ oB + (i*sb1) + (j*sb2) ] -= Wv[ oW + (i*sw1) + ((K-l+j)*sw2) ];
			Bv[ oB + (i*sb1) + (j*sb2) + 1 ] -= Wv[ oW + (i*sw1) + ((K-l+j)*sw2) + 1 ];
		}
	}
}


// EXPORTS //

export default ztprfb;
