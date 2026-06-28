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

import dgeqrf from '../../dgeqrf/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dgerqf from '../../dgerqf/lib/base.js';


// MAIN //

/**
* Computes a generalized QR factorization of an N-by-M matrix A and an.
* N-by-P matrix B:
*
*     A = Q*R,        B = Q*T*Z,
*
* where Q is an N-by-N orthogonal matrix, Z is a P-by-P orthogonal matrix,
* and R and T are upper trapezoidal/triangular.
*
* @private
* @param {NonNegativeInteger} N - number of rows of A and B
* @param {NonNegativeInteger} M - number of columns of A
* @param {NonNegativeInteger} p - number of columns of B
* @param {Float64Array} A - N-by-M matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for TAUA
* @param {NonNegativeInteger} offsetTAUA - offset for TAUA
* @param {Float64Array} B - N-by-P matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for TAUB
* @param {NonNegativeInteger} offsetTAUB - offset for TAUB
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {integer} lwork - length of workspace
* @returns {integer} info - 0 on success
*/
function dggqrf( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// QR factorization of N-by-M matrix A: A = Q*R
	dgeqrf( N, M, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, WORK, strideWork, offsetWork );

	// Update B := Q**T * B
	dormqr( 'left', 'transpose', N, p, Math.min( N, M ), A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ); // eslint-disable-line max-len

	// RQ factorization of N-by-P matrix B: B = T*Z
	dgerqf( N, p, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWork, offsetWork );

	return 0;
}


// EXPORTS //

export default dggqrf;
