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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of an M-by-N complex matrix A and a P-by-N complex matrix B, using alternative indexing semantics.
*
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} p - number of rows of B
* @param {Int32Array} K - output: K[0] receives first dimension of subblocks
* @param {Int32Array} l - output: l[0] receives second dimension of subblocks
* @param {Complex128Array} A - M-by-N matrix A (overwritten with triangular R)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B (complex elements)
* @param {integer} strideB2 - stride of second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Float64Array} ALPHA - output array for alpha values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Complex128Array} U - M-by-M unitary matrix U
* @param {integer} strideU1 - stride of first dimension of U
* @param {integer} strideU2 - stride of second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Complex128Array} V - P-by-P unitary matrix V
* @param {integer} strideV1 - stride of first dimension of V
* @param {integer} strideV2 - stride of second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Complex128Array} Q - N-by-N unitary matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q
* @param {integer} strideQ2 - stride of second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace size; -1 for workspace query
* @param {Float64Array} RWORK - real workspace of length at least 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @throws {TypeError} first argument must be a valid jobu value
* @throws {TypeError} second argument must be a valid jobv value
* @throws {TypeError} third argument must be a valid jobq value
* @returns {integer} info - 0 for success, 1 if Jacobi procedure failed to converge
*/
function zggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork ) {
	if ( jobu !== 'none' && jobu !== 'compute-U' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobu value. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-V' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobv value. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-Q' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid jobq value. Value: `%s`.', jobq ) );
	}
	return base( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork );
}


// EXPORTS //

export default zggsvd3;
