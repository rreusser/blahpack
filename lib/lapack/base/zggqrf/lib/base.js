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

// MODULES //

import zgeqrf from '../../zgeqrf/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import zgerqf from '../../zgerqf/lib/base.js';


// MAIN //

/**
* Computes a generalized QR factorization of an N-by-M matrix A and an.
* N-by-P matrix B:
*
* ```text
* A = Q*R,        B = Q*T*Z,
* ```
*
* where Q is an N-by-N unitary matrix, Z is a P-by-P unitary matrix,
* and R and T are upper trapezoidal/triangular.
*
* A, TAUA, B, TAUB, and WORK are Complex128Arrays. Strides and offsets
* are in complex elements.
*
* @private
* @param {NonNegativeInteger} N - number of rows of A and B
* @param {NonNegativeInteger} M - number of columns of A
* @param {NonNegativeInteger} p - number of columns of B
* @param {Complex128Array} A - N-by-M matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for `TAUA`
* @param {NonNegativeInteger} offsetTAUA - offset for `TAUA`
* @param {Complex128Array} B - N-by-P matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for `TAUB`
* @param {NonNegativeInteger} offsetTAUB - offset for `TAUB`
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - offset for `WORK`
* @param {integer} lwork - length of workspace
* @returns {integer} info - 0 on success
*/
function zggqrf( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	var min = Math.min;

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// QR factorization of N-by-M matrix A: A = Q*R
	zgeqrf( N, M, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, WORK, strideWork, offsetWork );

	// Update B := Q^H * B
	zunmqr( 'left', 'conjugate-transpose', N, p, min( N, M ), A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ); // eslint-disable-line max-len

	// RQ factorization of N-by-P matrix B: B = T*Z
	zgerqf( N, p, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWork, offsetWork, lwork );

	return 0;
}


// EXPORTS //

export default zggqrf;
