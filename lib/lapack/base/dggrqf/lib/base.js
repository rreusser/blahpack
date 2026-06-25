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

import dgerqf from '../../dgerqf/lib/base.js';
import dormrq from '../../dormrq/lib/base.js';
import dgeqrf from '../../dgeqrf/lib/base.js';


// MAIN //

/**
* Computes a generalized RQ factorization of an M-by-N matrix A and a.
* P-by-N matrix B:
*
* ```text
* A = R*Q,        B = Z*T*Q,
* ```
*
* where Q is an N-by-N orthogonal matrix, Z is a P-by-P orthogonal matrix,
* and R and T are upper trapezoidal/triangular.
*
* The caller must supply `work` as a `Float64Array` of length at least
* `max(1, M, p, N)` elements. For optimum performance (blocked paths in
* `dgerqf`, `dormrq`, and `dgeqrf`), the length should be
* `max(M, p, N) * NB` where `NB` is the optimal block size (typically 32-64).
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Float64Array} A - M-by-N matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for TAUA
* @param {NonNegativeInteger} offsetTAUA - offset for TAUA
* @param {Float64Array} B - P-by-N matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for TAUB
* @param {NonNegativeInteger} offsetTAUB - offset for TAUB
* @param {Float64Array} work - caller-provided workspace array (minimum length: max(1,M,p,N))
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @returns {integer} info - 0 on success
*/
function dggrqf( M, p, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, work, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var offsetAQ;
	var k;

	// Quick return if possible
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// RQ factorization of M-by-N matrix A: A = R*Q
	dgerqf( M, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, work, strideWork, offsetWork );

	// Update B := B*Q**T
	k = Math.min( M, N );

	// Offset to A(max(1,M-N+1), 1) in 0-based: row max(0, M-N)
	offsetAQ = offsetA + ( Math.max( 0, M - N ) * strideA1 );
	dormrq( 'right', 'transpose', p, N, k, A, strideA1, strideA2, offsetAQ, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, work, strideWork, offsetWork ); // eslint-disable-line max-len

	// QR factorization of P-by-N matrix B: B = Z*T
	dgeqrf( p, N, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, work, strideWork, offsetWork );

	return 0;
}


// EXPORTS //

export default dggrqf;
