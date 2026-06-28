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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import { ndarray as dgemm } from '../../../../blas/base/dgemm/lib/index.js';


// MAIN //

/**
* Multiplies a complex M-by-N matrix `A` by a real N-by-N matrix `B` and stores the result in a complex M-by-N matrix `C`.
*
* ## Notes
*
* -   Computes `C = A * B`, where `A` is complex M-by-N, `B` is real N-by-N, and `C` is complex M-by-N.
* -   `RWORK` is a real workspace of length at least `2*M*N`. The base routine treats `RWORK` as contiguous (stride 1, offset 0 are the only documented values for the underlying DGEMM call). The `strideRWork`/`offsetRWork` parameters select a starting position; the routine then uses `2*M*N` consecutive elements from there.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A` and `C`
* @param {NonNegativeInteger} N - number of columns of `A`, `C`, and the order of `B`
* @param {Complex128Array} A - input complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Float64Array} B - input real matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} C - output complex matrix
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Float64Array} RWORK - real workspace of length at least `2*M*N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {Complex128Array} `C`
*/
function zlacrm( M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork ) {
	var sa1;
	var sa2;
	var sc1;
	var sc2;
	var oW1;
	var oW2;
	var Av;
	var Cv;
	var oA;
	var oC;
	var ia;
	var ic;
	var iw;
	var i;
	var j;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return C;
	}

	Av = reinterpret( A, 0 );
	Cv = reinterpret( C, 0 );

	// Strides into the underlying Float64 buffer (×2 because complex elements are stored as interleaved re,im pairs):
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;
	oA = offsetA * 2;
	oC = offsetC * 2;

	// RWORK is partitioned as two contiguous M-by-N (column-major) blocks. Offset into RWORK is in real elements:
	oW1 = offsetRWork * strideRWork;
	oW2 = oW1 + ( M * N );

	// First DGEMM: extract Re(A) into RWORK[oW1..], compute RWORK[oW2..] = Re(A) * B, then write the real parts of C.
	for ( j = 0; j < N; j++ ) {
		ia = oA + ( j * sa2 );
		iw = oW1 + ( j * M );
		for ( i = 0; i < M; i++ ) {
			RWORK[ iw + i ] = Av[ ia + ( i * sa1 ) ];
		}
	}
	dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, RWORK, 1, M, oW1, B, strideB1, strideB2, offsetB, 0.0, RWORK, 1, M, oW2 );
	for ( j = 0; j < N; j++ ) {
		ic = oC + ( j * sc2 );
		iw = oW2 + ( j * M );
		for ( i = 0; i < M; i++ ) {
			Cv[ ic + ( i * sc1 ) ] = RWORK[ iw + i ];
		}
	}

	// Second DGEMM: extract Im(A) into RWORK[oW1..], compute RWORK[oW2..] = Im(A) * B, then write the imaginary parts of C.
	for ( j = 0; j < N; j++ ) {
		ia = oA + ( j * sa2 );
		iw = oW1 + ( j * M );
		for ( i = 0; i < M; i++ ) {
			RWORK[ iw + i ] = Av[ ia + ( i * sa1 ) + 1 ];
		}
	}
	dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, RWORK, 1, M, oW1, B, strideB1, strideB2, offsetB, 0.0, RWORK, 1, M, oW2 );
	for ( j = 0; j < N; j++ ) {
		ic = oC + ( j * sc2 );
		iw = oW2 + ( j * M );
		for ( i = 0; i < M; i++ ) {
			Cv[ ic + ( i * sc1 ) + 1 ] = RWORK[ iw + i ];
		}
	}
	return C;
}


// EXPORTS //

export default zlacrm;
