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

import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dlacpy from '../../../../lapack/base/dlacpy/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Multiplies a general matrix C by a banded orthogonal matrix Q.
*
* Computes one of: Q\*C, Q\*\*T\*C, C\*Q, or C\*Q\*\*T, overwriting C. The
* orthogonal matrix Q has block form
*
* ```text
* Q = [  Q11   Q12 ]
*     [  Q21   Q22 ]
* ```
*
* where Q11 is N1 x N2, Q12 is N1 x N1 lower triangular, Q21 is N2 x N2
* upper triangular, and Q22 is N2 x N1.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} n1 - dimension N1 of the banded structure
* @param {NonNegativeInteger} n2 - dimension N2 of the banded structure
* @param {Float64Array} Q - the NQ x NQ banded orthogonal matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} C - the M x N matrix to be multiplied
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace of length >= max(1, M*N)
* @param {integer} strideWORK - stride of `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {integer} lwork - length of `WORK`
* @returns {integer} status code (0 = success)
*/
function dorm22( side, trans, M, N, n1, n2, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork ) {
	var notran;
	var lwkopt;
	var ldwork;
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

	// Quick return.
	if ( M === 0 || N === 0 ) {
		WORK[ offsetWORK ] = 1;
		return 0;
	}

	// Degenerate banded cases: pure triangular multiplication.
	if ( n1 === 0 ) {
		dtrmm( side, 'upper', trans, 'non-unit', M, N, 1.0, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC );
		WORK[ offsetWORK ] = 1.0;
		return 0;
	}
	if ( n2 === 0 ) {
		dtrmm( side, 'lower', trans, 'non-unit', M, N, 1.0, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC );
		WORK[ offsetWORK ] = 1.0;
		return 0;
	}

	nb = Math.max( 1, Math.floor( Math.min( lwork, lwkopt ) / nq ) );

	// WORK is a contiguous scratch region used as a column-major 2D matrix with leading dimension `ldwork` and stride1 equal to `strideWORK`.

	if ( left ) {
		if ( notran ) {
			for ( i = 0; i < N; i += nb ) {
				len = Math.min( nb, N - i );
				ldwork = M;
				sw2 = ldwork * strideWORK;

				// W(1:n1, 1:len) := C(n2+1:M, i+1:i+len)
				dlacpy( 'all', n1, len, C, strideC1, strideC2, offsetC + (n2 * strideC1) + (i * strideC2), WORK, strideWORK, sw2, offsetWORK );

				// W(1:n1, 1:len) := Q(1:n1, n2+1:n2+n1) * W
				dtrmm( 'left', 'lower', 'no-transpose', 'non-unit', n1, len, 1.0, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWORK, sw2, offsetWORK );

				// W := W + Q(1:n1, 1:n2) * C(1:n2, i+1:i+len)
				dgemm( 'no-transpose', 'no-transpose', n1, len, n2, 1.0, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC + (i * strideC2), 1.0, WORK, strideWORK, sw2, offsetWORK );

				// W(n1+1:M, 1:len) := C(1:n2, i+1:i+len)
				dlacpy( 'all', n2, len, C, strideC1, strideC2, offsetC + (i * strideC2), WORK, strideWORK, sw2, offsetWORK + (n1 * strideWORK) );

				// W(n1+1:M, 1:len) := Q(n1+1:M, 1:n2) * W(n1+1:M, 1:len)
				dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', n2, len, 1.0, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWORK, sw2, offsetWORK + (n1 * strideWORK) );

				// W(n1+1:M, 1:len) := W(n1+1:M, 1:len) + Q(n1+1:M, n2+1:M) * C(n2+1:M, i+1:i+len)
				dgemm( 'no-transpose', 'no-transpose', n2, len, n1, 1.0, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), C, strideC1, strideC2, offsetC + (n2 * strideC1) + (i * strideC2), 1.0, WORK, strideWORK, sw2, offsetWORK + (n1 * strideWORK) );

				// C(1:M, i+1:i+len) := W
				dlacpy( 'all', M, len, WORK, strideWORK, sw2, offsetWORK, C, strideC1, strideC2, offsetC + (i * strideC2) );
			}
		} else {
			for ( i = 0; i < N; i += nb ) {
				len = Math.min( nb, N - i );
				ldwork = M;
				sw2 = ldwork * strideWORK;

				// W(1:n2, 1:len) := C(n1+1:M, i+1:i+len)
				dlacpy( 'all', n2, len, C, strideC1, strideC2, offsetC + (n1 * strideC1) + (i * strideC2), WORK, strideWORK, sw2, offsetWORK );

				// W(1:n2, 1:len) := Q(n1+1:M, 1:n2)**T * W
				dtrmm( 'left', 'upper', 'transpose', 'non-unit', n2, len, 1.0, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWORK, sw2, offsetWORK );

				// W := W + Q(1:n1, 1:n2)**T * C(1:n1, i+1:i+len)
				dgemm( 'transpose', 'no-transpose', n2, len, n1, 1.0, Q, strideQ1, strideQ2, offsetQ, C, strideC1, strideC2, offsetC + (i * strideC2), 1.0, WORK, strideWORK, sw2, offsetWORK );

				// W(n2+1:M, 1:len) := C(1:n1, i+1:i+len)
				dlacpy( 'all', n1, len, C, strideC1, strideC2, offsetC + (i * strideC2), WORK, strideWORK, sw2, offsetWORK + (n2 * strideWORK) );

				// W(n2+1:M, 1:len) := Q(1:n1, n2+1:M)**T * W(n2+1:M, 1:len)
				dtrmm( 'left', 'lower', 'transpose', 'non-unit', n1, len, 1.0, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWORK, sw2, offsetWORK + (n2 * strideWORK) );

				// W(n2+1:M, 1:len) := W(n2+1:M, 1:len) + Q(n1+1:M, n2+1:M)**T * C(n1+1:M, i+1:i+len)
				dgemm( 'transpose', 'no-transpose', n1, len, n2, 1.0, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), C, strideC1, strideC2, offsetC + (n1 * strideC1) + (i * strideC2), 1.0, WORK, strideWORK, sw2, offsetWORK + (n2 * strideWORK) );

				// C(1:M, i+1:i+len) := W
				dlacpy( 'all', M, len, WORK, strideWORK, sw2, offsetWORK, C, strideC1, strideC2, offsetC + (i * strideC2) );
			}
		}
	} else if ( notran ) {
		for ( i = 0; i < M; i += nb ) {
			len = Math.min( nb, M - i );
			ldwork = len;
			sw2 = ldwork * strideWORK;

			// W(1:len, 1:n2) := C(i+1:i+len, n1+1:N)
			dlacpy( 'all', len, n2, C, strideC1, strideC2, offsetC + (i * strideC1) + (n1 * strideC2), WORK, strideWORK, sw2, offsetWORK );

			// W := W * Q(n1+1:N, 1:n2)
			dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', len, n2, 1.0, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWORK, sw2, offsetWORK );

			// W := W + C(i+1:i+len, 1:n1) * Q(1:n1, 1:n2)
			dgemm( 'no-transpose', 'no-transpose', len, n2, n1, 1.0, C, strideC1, strideC2, offsetC + (i * strideC1), Q, strideQ1, strideQ2, offsetQ, 1.0, WORK, strideWORK, sw2, offsetWORK );

			// W(1:len, n2+1:N) := C(i+1:i+len, 1:n1)
			dlacpy( 'all', len, n1, C, strideC1, strideC2, offsetC + (i * strideC1), WORK, strideWORK, sw2, offsetWORK + (n2 * sw2) );

			// W(1:len, n2+1:N) := W(1:len, n2+1:N) * Q(1:n1, n2+1:N)
			dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', len, n1, 1.0, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWORK, sw2, offsetWORK + (n2 * sw2) );

			// W(1:len, n2+1:N) := W(1:len, n2+1:N) + C(i+1:i+len, n1+1:N) * Q(n1+1:N, n2+1:N)
			dgemm( 'no-transpose', 'no-transpose', len, n1, n2, 1.0, C, strideC1, strideC2, offsetC + (i * strideC1) + (n1 * strideC2), Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), 1.0, WORK, strideWORK, sw2, offsetWORK + (n2 * sw2) );

			// C(i+1:i+len, 1:N) := W
			dlacpy( 'all', len, N, WORK, strideWORK, sw2, offsetWORK, C, strideC1, strideC2, offsetC + (i * strideC1) );
		}
	} else {
		for ( i = 0; i < M; i += nb ) {
			len = Math.min( nb, M - i );
			ldwork = len;
			sw2 = ldwork * strideWORK;

			// W(1:len, 1:n1) := C(i+1:i+len, n2+1:N)
			dlacpy( 'all', len, n1, C, strideC1, strideC2, offsetC + (i * strideC1) + (n2 * strideC2), WORK, strideWORK, sw2, offsetWORK );

			// W := W * Q(1:n1, n2+1:N)**T
			dtrmm( 'right', 'lower', 'transpose', 'non-unit', len, n1, 1.0, Q, strideQ1, strideQ2, offsetQ + (n2 * strideQ2), WORK, strideWORK, sw2, offsetWORK );

			// W := W + C(i+1:i+len, 1:n1) * Q(1:n1, 1:n2)**T
			dgemm( 'no-transpose', 'transpose', len, n1, n2, 1.0, C, strideC1, strideC2, offsetC + (i * strideC1), Q, strideQ1, strideQ2, offsetQ, 1.0, WORK, strideWORK, sw2, offsetWORK );

			// W(1:len, n1+1:N) := C(i+1:i+len, 1:n2)
			dlacpy( 'all', len, n2, C, strideC1, strideC2, offsetC + (i * strideC1), WORK, strideWORK, sw2, offsetWORK + (n1 * sw2) );

			// W(1:len, n1+1:N) := W(1:len, n1+1:N) * Q(n1+1:N, 1:n2)**T
			dtrmm( 'right', 'upper', 'transpose', 'non-unit', len, n2, 1.0, Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1), WORK, strideWORK, sw2, offsetWORK + (n1 * sw2) );

			// W(1:len, n1+1:N) := W(1:len, n1+1:N) + C(i+1:i+len, n2+1:N) * Q(n1+1:N, n2+1:N)**T
			dgemm( 'no-transpose', 'transpose', len, n2, n1, 1.0, C, strideC1, strideC2, offsetC + (i * strideC1) + (n2 * strideC2), Q, strideQ1, strideQ2, offsetQ + (n1 * strideQ1) + (n2 * strideQ2), 1.0, WORK, strideWORK, sw2, offsetWORK + (n1 * sw2) );

			// C(i+1:i+len, 1:N) := W
			dlacpy( 'all', len, N, WORK, strideWORK, sw2, offsetWORK, C, strideC1, strideC2, offsetC + (i * strideC1) );
		}
	}

	WORK[ offsetWORK ] = lwkopt;
	return 0;
}


// EXPORTS //

export default dorm22;
