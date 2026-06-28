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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dgemm from './../../../../blas/base/dgemm/lib/base.js';


// MAIN //

/**
* Performs the matrix-matrix multiplication `C = A * B`, where `A` is an `M`-by-`M` real matrix and `B` is an `M`-by-`N` complex matrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A` and `C`
* @param {NonNegativeInteger} N - number of columns of `B` and `C`
* @param {Float64Array} A - real `M`-by-`M` input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - complex `M`-by-`N` input matrix
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} C - complex `M`-by-`N` output matrix
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Float64Array} RWORK - real workspace of length at least `2*M*N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {Complex128Array} `C`
*/
function zlarcm( M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork ) {
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var Bv;
	var Cv;
	var oL;
	var ib;
	var ic;
	var ir;
	var i;
	var j;

	// Quick return if possible:
	if ( M === 0 || N === 0 ) {
		return C;
	}

	// Reinterpret complex arrays as Float64 views (interleaved re,im):
	Bv = reinterpret( B, 0 );
	Cv = reinterpret( C, 0 );
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	// Pack the real parts of `B` into RWORK as a contiguous M-by-N column-major matrix:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ib = (offsetB * 2) + (i * sb1) + (j * sb2);
			RWORK[ offsetRWork + ( ( (j * M) + i ) * strideRWork ) ] = Bv[ ib ];
		}
	}

	// Compute `RWORK(L:) := A * RWORK(:)` via DGEMM, where `L = M*N` (0-based) is the offset to the output partition.
	oL = offsetRWork + ( (M * N) * strideRWork );
	dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, A, strideA1, strideA2, offsetA, RWORK, strideRWork, M * strideRWork, offsetRWork, 0.0, RWORK, strideRWork, M * strideRWork, oL );

	// Copy the real result into the real part of `C`:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ic = (offsetC * 2) + (i * sc1) + (j * sc2);
			Cv[ ic ] = RWORK[ oL + ( ( (j * M) + i ) * strideRWork ) ];
		}
	}

	// Pack the imaginary parts of `B` into RWORK:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ib = (offsetB * 2) + (i * sb1) + (j * sb2);
			RWORK[ offsetRWork + ( ( (j * M) + i ) * strideRWork ) ] = Bv[ ib + 1 ];
		}
	}
	dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, A, strideA1, strideA2, offsetA, RWORK, strideRWork, M * strideRWork, offsetRWork, 0.0, RWORK, strideRWork, M * strideRWork, oL );

	// Copy the imaginary result into the imaginary part of `C`:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ic = (offsetC * 2) + (i * sc1) + (j * sc2);
			ir = oL + ( ( (j * M) + i ) * strideRWork );
			Cv[ ic + 1 ] = RWORK[ ir ];
		}
	}
	return C;
}


// EXPORTS //

export default zlarcm;
