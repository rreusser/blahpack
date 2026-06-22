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

/* eslint-disable max-len, max-lines-per-function, max-statements */

// MODULES //

import dtftri from '../../dtftri/lib/base.js';
import dlauum from '../../dlauum/lib/base.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric positive definite matrix stored in Rectangular Full Packed (RFP) format.
*
* Uses the Cholesky factorization `A = U^T * U` or `A = L * L^T` computed by dpftrf.
*
* @private
* @param {string} transr - `'no-transpose'` or `'transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @returns {integer} info - 0 if successful, k>0 if the (k,k) element of the factor is zero
*/
function dpftri( transr, uplo, N, A, strideA, offsetA ) {
	var normalTransr;
	var nisodd;
	var lower;
	var info;
	var sa;
	var n1;
	var n2;
	var k;

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );

	if ( N === 0 ) {
		return 0;
	}

	sa = strideA;

	// Invert the triangular Cholesky factor U or L...
	info = dtftri( transr, uplo, 'non-unit', N, A, sa, offsetA );
	if ( info > 0 ) {
		return info;
	}

	if ( N % 2 === 0 ) {
		k = N / 2;
		nisodd = false;
	} else {
		nisodd = true;
	}

	if ( lower ) {
		n2 = Math.floor( N / 2 );
		n1 = N - n2;
	} else {
		n1 = Math.floor( N / 2 );
		n2 = N - n1;
	}

	// Compute inv(U)*inv(U)^T or inv(L)^T*inv(L). Eight cases.
	if ( nisodd && normalTransr && lower ) {
		// N is odd, TRANSR = 'N', UPLO = 'L'
		// SRPA for LOWER, NORMAL, N odd: LDA = N
		dlauum( 'lower', n1, A, sa, sa * N, offsetA );
		dsyrk( 'lower', 'transpose', n1, n2, 1.0, A, sa, sa * N, offsetA + (sa * n1), 1.0, A, sa, sa * N, offsetA );
		dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', n2, n1, 1.0, A, sa, sa * N, offsetA + (sa * N), A, sa, sa * N, offsetA + (sa * n1) );
		dlauum( 'upper', n2, A, sa, sa * N, offsetA + (sa * N) );
	} else if ( nisodd && normalTransr ) {
		// N is odd, TRANSR = 'N', UPLO = 'U'
		// SRPA for UPPER, NORMAL, N odd: LDA = N
		dlauum( 'lower', n1, A, sa, sa * N, offsetA + (sa * n2) );
		dsyrk( 'lower', 'no-transpose', n1, n2, 1.0, A, sa, sa * N, offsetA, 1.0, A, sa, sa * N, offsetA + (sa * n2) );
		dtrmm( 'right', 'upper', 'transpose', 'non-unit', n1, n2, 1.0, A, sa, sa * N, offsetA + (sa * n1), A, sa, sa * N, offsetA );
		dlauum( 'upper', n2, A, sa, sa * N, offsetA + (sa * n1) );
	} else if ( nisodd && lower ) {
		// N is odd, TRANSR = 'T', UPLO = 'L'
		// SRPA for LOWER, TRANSPOSE, N odd: LDA = N1
		dlauum( 'upper', n1, A, sa, sa * n1, offsetA );
		dsyrk( 'upper', 'no-transpose', n1, n2, 1.0, A, sa, sa * n1, offsetA + (sa * n1 * n1), 1.0, A, sa, sa * n1, offsetA );
		dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', n1, n2, 1.0, A, sa, sa * n1, offsetA + sa, A, sa, sa * n1, offsetA + (sa * n1 * n1) );
		dlauum( 'lower', n2, A, sa, sa * n1, offsetA + sa );
	} else if ( nisodd ) {
		// N is odd, TRANSR = 'T', UPLO = 'U'
		// SRPA for UPPER, TRANSPOSE, N odd: LDA = N2
		dlauum( 'upper', n1, A, sa, sa * n2, offsetA + (sa * n2 * n2) );
		dsyrk( 'upper', 'transpose', n1, n2, 1.0, A, sa, sa * n2, offsetA, 1.0, A, sa, sa * n2, offsetA + (sa * n2 * n2) );
		dtrmm( 'left', 'lower', 'transpose', 'non-unit', n2, n1, 1.0, A, sa, sa * n2, offsetA + (sa * n1 * n2), A, sa, sa * n2, offsetA );
		dlauum( 'lower', n2, A, sa, sa * n2, offsetA + (sa * n1 * n2) );
	} else if ( normalTransr && lower ) {
		// N is even, TRANSR = 'N', UPLO = 'L'
		// SRPA for LOWER, NORMAL, N even: LDA = N+1
		dlauum( 'lower', k, A, sa, sa * (N + 1), offsetA + sa );
		dsyrk( 'lower', 'transpose', k, k, 1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)), 1.0, A, sa, sa * (N + 1), offsetA + sa );
		dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', k, k, 1.0, A, sa, sa * (N + 1), offsetA, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
		dlauum( 'upper', k, A, sa, sa * (N + 1), offsetA );
	} else if ( normalTransr ) {
		// N is even, TRANSR = 'N', UPLO = 'U'
		// SRPA for UPPER, NORMAL, N even: LDA = N+1
		dlauum( 'lower', k, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
		dsyrk( 'lower', 'no-transpose', k, k, 1.0, A, sa, sa * (N + 1), offsetA, 1.0, A, sa, sa * (N + 1), offsetA + (sa * (k + 1)) );
		dtrmm( 'right', 'upper', 'transpose', 'non-unit', k, k, 1.0, A, sa, sa * (N + 1), offsetA + (sa * k), A, sa, sa * (N + 1), offsetA );
		dlauum( 'upper', k, A, sa, sa * (N + 1), offsetA + (sa * k) );
	} else if ( lower ) {
		// N is even, TRANSR = 'T', UPLO = 'L'
		// SRPA for LOWER, TRANSPOSE, N even: LDA = K
		dlauum( 'upper', k, A, sa, sa * k, offsetA + (sa * k) );
		dsyrk( 'upper', 'no-transpose', k, k, 1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)), 1.0, A, sa, sa * k, offsetA + (sa * k) );
		dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', k, k, 1.0, A, sa, sa * k, offsetA, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
		dlauum( 'lower', k, A, sa, sa * k, offsetA );
	} else {
		// N is even, TRANSR = 'T', UPLO = 'U'
		// SRPA for UPPER, TRANSPOSE, N even: LDA = K
		dlauum( 'upper', k, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
		dsyrk( 'upper', 'transpose', k, k, 1.0, A, sa, sa * k, offsetA, 1.0, A, sa, sa * k, offsetA + (sa * k * (k + 1)) );
		dtrmm( 'left', 'lower', 'transpose', 'non-unit', k, k, 1.0, A, sa, sa * k, offsetA + (sa * k * k), A, sa, sa * k, offsetA );
		dlauum( 'lower', k, A, sa, sa * k, offsetA + (sa * k * k) );
	}

	return 0;
}


// EXPORTS //

export default dpftri;
