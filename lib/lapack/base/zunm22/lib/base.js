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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import zlacpy from './../../../../lapack/base/zlacpy/lib/base.js';
import ztrmm from './../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Multiplies a general matrix `C` by a banded unitary matrix `Q`.
*
* ## Notes
*
* -   Computes one of `Q*C`, `Q**H*C`, `C*Q`, or `C*Q**H`, overwriting `C`. The
*     unitary matrix `Q` has block form
*
*     ```text
*     Q = [  Q11   Q12 ]
*         [  Q21   Q22 ]
*     ```
*
*     where `Q11` is `N1 x N2`, `Q12` is `N1 x N1` lower triangular, `Q21` is
*     `N2 x N2` upper triangular, and `Q22` is `N2 x N1`.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} n1 - dimension `N1` of the banded structure
* @param {NonNegativeInteger} n2 - dimension `N2` of the banded structure
* @param {Complex128Array} Q - the `NQ x NQ` banded unitary matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Complex128Array} C - the `M x N` matrix to be multiplied
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Complex128Array} WORK - workspace of length `>= max(1, M*N)`
* @param {integer} strideWork - stride of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {integer} lwork - length of `WORK`
* @returns {integer} status code (`0` = success)
*/
function zunm22( side, trans, M, N, n1, n2, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork, lwork ) {
	var notran;
	var lwkopt;
	var ldwork;
	var WORKv;
	var left;
	var len;
	var sw2;
	var nq;
	var nw;
	var nb;
	var i;

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}
	nw = nq;
	if ( n1 === 0 || n2 === 0 ) {
		nw = 1;
	}

	lwkopt = M * N;
	if ( lwork < nw ) {
		return -12;
	}

	WORKv = reinterpret( WORK, 0 );

	// Quick return.
	if ( M === 0 || N === 0 ) {
		WORKv[ offsetWork * 2 ] = 1.0;
		WORKv[ ( offsetWork * 2 ) + 1 ] = 0.0;
		return 0;
	}

	// Degenerate banded cases: pure triangular multiplication.
	if ( n1 === 0 ) {
		ztrmm( side, 'upper', trans, 'non-unit', M, N, CONE, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC );
		WORKv[ offsetWork * 2 ] = 1.0;
		WORKv[ ( offsetWork * 2 ) + 1 ] = 0.0;
		return 0;
	}
	if ( n2 === 0 ) {
		ztrmm( side, 'lower', trans, 'non-unit', M, N, CONE, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC );
		WORKv[ offsetWork * 2 ] = 1.0;
		WORKv[ ( offsetWork * 2 ) + 1 ] = 0.0;
		return 0;
	}

	nb = Math.max( 1, Math.floor( Math.min( lwork, lwkopt ) / nq ) );

	// WORK is a contiguous scratch region used as a column-major 2D matrix with leading dimension `ldwork` and stride1 equal to `strideWork`.

	if ( left ) {
		if ( notran ) {
			for ( i = 0; i < N; i += nb ) {
				len = Math.min( nb, N - i );
				ldwork = M;
				sw2 = ldwork * strideWork;

				// W(1:n1, 1:len) := C(n2+1:M, i+1:i+len)
				zlacpy( 'all', n1, len, C, strideC1, strideC2, offsetC + (n2 * strideC1) + (i * strideC2), WORK, strideWork, sw2, offsetWork );

				// W(1:n1, 1:len) := Q(1:n1, n2+1:n2+n1) * W
				ztrmm( 'left', 'lower', 'no-transpose', 'non-unit', n1, len, CONE, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWork, sw2, offsetWork );

				// W := W + Q(1:n1, 1:n2) * C(1:n2, i+1:i+len)
				zgemm( 'no-transpose', 'no-transpose', n1, len, n2, CONE, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC + (i * strideC2), CONE, WORK, strideWork, sw2, offsetWork );

				// W(n1+1:M, 1:len) := C(1:n2, i+1:i+len)
				zlacpy( 'all', n2, len, C, strideC1, strideC2, offsetC + (i * strideC2), WORK, strideWork, sw2, offsetWork + (n1 * strideWork) );

				// W(n1+1:M, 1:len) := Q(n1+1:M, 1:n2) * W(n1+1:M, 1:len)
				ztrmm( 'left', 'upper', 'no-transpose', 'non-unit', n2, len, CONE, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWork, sw2, offsetWork + (n1 * strideWork) );

				// W(n1+1:M, 1:len) := W(n1+1:M, 1:len) + Q(n1+1:M, n2+1:M) * C(n2+1:M, i+1:i+len)
				zgemm( 'no-transpose', 'no-transpose', n2, len, n1, CONE, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), C, strideC1, strideC2, offsetC + (n2 * strideC1) + (i * strideC2), CONE, WORK, strideWork, sw2, offsetWork + (n1 * strideWork) );

				// C(1:M, i+1:i+len) := W
				zlacpy( 'all', M, len, WORK, strideWork, sw2, offsetWork, C, strideC1, strideC2, offsetC + (i * strideC2) );
			}
		} else {
			for ( i = 0; i < N; i += nb ) {
				len = Math.min( nb, N - i );
				ldwork = M;
				sw2 = ldwork * strideWork;

				// W(1:n2, 1:len) := C(n1+1:M, i+1:i+len)
				zlacpy( 'all', n2, len, C, strideC1, strideC2, offsetC + (n1 * strideC1) + (i * strideC2), WORK, strideWork, sw2, offsetWork );

				// W(1:n2, 1:len) := Q(n1+1:M, 1:n2)**H * W
				ztrmm( 'left', 'upper', 'conjugate-transpose', 'non-unit', n2, len, CONE, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWork, sw2, offsetWork );

				// W := W + Q(1:n1, 1:n2)**H * C(1:n1, i+1:i+len)
				zgemm( 'conjugate-transpose', 'no-transpose', n2, len, n1, CONE, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC + (i * strideC2), CONE, WORK, strideWork, sw2, offsetWork );

				// W(n2+1:M, 1:len) := C(1:n1, i+1:i+len)
				zlacpy( 'all', n1, len, C, strideC1, strideC2, offsetC + (i * strideC2), WORK, strideWork, sw2, offsetWork + (n2 * strideWork) );

				// W(n2+1:M, 1:len) := Q(1:n1, n2+1:M)**H * W(n2+1:M, 1:len)
				ztrmm( 'left', 'lower', 'conjugate-transpose', 'non-unit', n1, len, CONE, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWork, sw2, offsetWork + (n2 * strideWork) );

				// W(n2+1:M, 1:len) := W(n2+1:M, 1:len) + Q(n1+1:M, n2+1:M)**H * C(n1+1:M, i+1:i+len)
				zgemm( 'conjugate-transpose', 'no-transpose', n1, len, n2, CONE, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), C, strideC1, strideC2, offsetC + (n1 * strideC1) + (i * strideC2), CONE, WORK, strideWork, sw2, offsetWork + (n2 * strideWork) );

				// C(1:M, i+1:i+len) := W
				zlacpy( 'all', M, len, WORK, strideWork, sw2, offsetWork, C, strideC1, strideC2, offsetC + (i * strideC2) );
			}
		}
	} else if ( notran ) {
		for ( i = 0; i < M; i += nb ) {
			len = Math.min( nb, M - i );
			ldwork = len;
			sw2 = ldwork * strideWork;

			// W(1:len, 1:n2) := C(i+1:i+len, n1+1:N)
			zlacpy( 'all', len, n2, C, strideC1, strideC2, offsetC + (i * strideC1) + (n1 * strideC2), WORK, strideWork, sw2, offsetWork );

			// W := W * Q(n1+1:N, 1:n2)
			ztrmm( 'right', 'upper', 'no-transpose', 'non-unit', len, n2, CONE, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWork, sw2, offsetWork );

			// W := W + C(i+1:i+len, 1:n1) * Q(1:n1, 1:n2)
			zgemm( 'no-transpose', 'no-transpose', len, n2, n1, CONE, C, strideC1, strideC2, offsetC + (i * strideC1), Q, strideQ1, strideQ2, offsetQ, CONE, WORK, strideWork, sw2, offsetWork );

			// W(1:len, n2+1:N) := C(i+1:i+len, 1:n1)
			zlacpy( 'all', len, n1, C, strideC1, strideC2, offsetC + (i * strideC1), WORK, strideWork, sw2, offsetWork + (n2 * sw2) );

			// W(1:len, n2+1:N) := W(1:len, n2+1:N) * Q(1:n1, n2+1:N)
			ztrmm( 'right', 'lower', 'no-transpose', 'non-unit', len, n1, CONE, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWork, sw2, offsetWork + (n2 * sw2) );

			// W(1:len, n2+1:N) := W(1:len, n2+1:N) + C(i+1:i+len, n1+1:N) * Q(n1+1:N, n2+1:N)
			zgemm( 'no-transpose', 'no-transpose', len, n1, n2, CONE, C, strideC1, strideC2, offsetC + (i * strideC1) + (n1 * strideC2), Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), CONE, WORK, strideWork, sw2, offsetWork + (n2 * sw2) );

			// C(i+1:i+len, 1:N) := W
			zlacpy( 'all', len, N, WORK, strideWork, sw2, offsetWork, C, strideC1, strideC2, offsetC + (i * strideC1) );
		}
	} else {
		for ( i = 0; i < M; i += nb ) {
			len = Math.min( nb, M - i );
			ldwork = len;
			sw2 = ldwork * strideWork;

			// W(1:len, 1:n1) := C(i+1:i+len, n2+1:N)
			zlacpy( 'all', len, n1, C, strideC1, strideC2, offsetC + (i * strideC1) + (n2 * strideC2), WORK, strideWork, sw2, offsetWork );

			// W := W * Q(1:n1, n2+1:N)**H
			ztrmm( 'right', 'lower', 'conjugate-transpose', 'non-unit', len, n1, CONE, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWork, sw2, offsetWork );

			// W := W + C(i+1:i+len, 1:n1) * Q(1:n1, 1:n2)**H
			zgemm( 'no-transpose', 'conjugate-transpose', len, n1, n2, CONE, C, strideC1, strideC2, offsetC + (i * strideC1), Q, strideQ1, strideQ2, offsetQ, CONE, WORK, strideWork, sw2, offsetWork );

			// W(1:len, n1+1:N) := C(i+1:i+len, 1:n2)
			zlacpy( 'all', len, n2, C, strideC1, strideC2, offsetC + (i * strideC1), WORK, strideWork, sw2, offsetWork + (n1 * sw2) );

			// W(1:len, n1+1:N) := W(1:len, n1+1:N) * Q(n1+1:N, 1:n2)**H
			ztrmm( 'right', 'upper', 'conjugate-transpose', 'non-unit', len, n2, CONE, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWork, sw2, offsetWork + (n1 * sw2) );

			// W(1:len, n1+1:N) := W(1:len, n1+1:N) + C(i+1:i+len, n2+1:N) * Q(n1+1:N, n2+1:N)**H
			zgemm( 'no-transpose', 'conjugate-transpose', len, n2, n1, CONE, C, strideC1, strideC2, offsetC + (i * strideC1) + (n2 * strideC2), Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), CONE, WORK, strideWork, sw2, offsetWork + (n1 * sw2) );

			// C(i+1:i+len, 1:N) := W
			zlacpy( 'all', len, N, WORK, strideWork, sw2, offsetWork, C, strideC1, strideC2, offsetC + (i * strideC1) );
		}
	}

	WORKv[ offsetWork * 2 ] = lwkopt;
	WORKv[ ( offsetWork * 2 ) + 1 ] = 0.0;
	return 0;
}


// EXPORTS //

export default zunm22;
