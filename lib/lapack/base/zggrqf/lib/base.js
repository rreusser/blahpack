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

import zgerqf from '../../zgerqf/lib/base.js';
import zunmrq from '../../zunmrq/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';


// MAIN //

/**
* Computes a generalized RQ factorization of an M-by-N matrix A and a.
* P-by-N matrix B:
*
* ```text
* A = R*Q,        B = Z*T*Q,
* ```
*
* where Q is an N-by-N unitary matrix, Z is a P-by-P unitary matrix,
* and R and T are upper trapezoidal/triangular.
*
* A, TAUA, B, TAUB, and WORK are Complex128Arrays. Strides and offsets
* are in complex elements.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Complex128Array} A - M-by-N matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for `TAUA`
* @param {NonNegativeInteger} offsetTAUA - offset for `TAUA`
* @param {Complex128Array} B - P-by-N matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for `TAUB`
* @param {NonNegativeInteger} offsetTAUB - offset for `TAUB`
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - offset for `WORK`
* @param {integer} lwork - length of workspace
* @returns {integer} info - 0 on success
*/
function zggrqf( M, p, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	var offsetRQ;
	var min = Math.min;
	var max = Math.max;

	// Quick return if possible
	if ( M === 0 || N === 0 || p === 0 ) {
		return 0;
	}

	// RQ factorization of M-by-N matrix A: A = R*Q
	zgerqf( M, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, WORK, strideWORK, offsetWORK, lwork );

	// Update B := B*Q^H

	// The reflectors are in rows max(1,M-N+1):M of A (0-indexed: max(0,M-N) row)
	offsetRQ = offsetA + ( max( 0, M - N ) * strideA1 );
	zunmrq( 'right', 'conjugate-transpose', p, N, min( M, N ), A, strideA1, strideA2, offsetRQ, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len

	// QR factorization of P-by-N matrix B: B = Z*T
	zgeqrf( p, N, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWORK, offsetWORK );

	return 0;
}


// EXPORTS //

export default zggrqf;
