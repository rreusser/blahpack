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

/* eslint-disable max-len, max-lines-per-function, max-statements, no-lonely-if, max-depth */

// MODULES //

import floor from '@stdlib/math/base/special/floor/lib/index.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';


// MAIN //

/**
* Performs a symmetric rank-k operation for a matrix in Rectangular Full Packed (RFP) format.
*
* The operation is one of C := alpha \* A \* A^T + beta \* C, or
* C := alpha \* A^T \* A + beta \* C, where alpha and beta are real scalars,
* C is an N-by-N symmetric matrix stored in RFP format, and A is an
* N-by-K or K-by-N matrix.
*
* @private
* @param {string} transr - `'no-transpose'` or `'transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of symmetric matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans='no-transpose') or rows of A (if trans='transpose')
* @param {number} alpha - scalar multiplier for A*A^T or A^T*A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} beta - scalar multiplier for `C`
* @param {Float64Array} C - RFP array of length N*(N+1)/2
* @param {integer} strideC - stride for `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @returns {Float64Array} `C`
*/
function dsfrk( transr, uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC, offsetC ) { // eslint-disable-line max-params
	var normalTransr;
	var notrans;
	var nisodd;
	var lower;
	var nt;
	var sc;
	var n1;
	var n2;
	var nk;
	var j;

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );
	notrans = ( trans === 'no-transpose' );

	// Quick return if possible...
	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	// alpha === 0 && beta === 0 => zero out C
	if ( alpha === 0.0 && beta === 0.0 ) {
		nt = floor( ( N * ( N + 1 ) ) / 2 );
		for ( j = 0; j < nt; j++ ) {
			C[ offsetC + ( j * strideC ) ] = 0.0;
		}
		return C;
	}

	sc = strideC;

	if ( N % 2 === 0 ) {
		nisodd = false;
		nk = floor( N / 2 );
	} else {
		nisodd = true;
		if ( lower ) {
			n2 = floor( N / 2 );
			n1 = N - n2;
		} else {
			n1 = floor( N / 2 );
			n2 = N - n1;
		}
	}

	if ( nisodd ) {
		// N is odd
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N
			if ( lower ) {
				// UPLO = 'L'
				if ( notrans ) {
					// C(1) => offset 0, LDA=N
					dsyrk( 'lower', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * N, offsetC );
					// C(N+1) => offset N, LDA=N
					dsyrk( 'upper', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sc, sc * N, offsetC + ( sc * N ) );
					// C(N1+1) => offset N1, LDA=N
					dgemm( 'no-transpose', 'transpose', n2, n1, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * N, offsetC + ( sc * n1 ) );
				} else {
					// TRANS = 'T'
					dsyrk( 'lower', 'transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * N, offsetC );
					dsyrk( 'upper', 'transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sc, sc * N, offsetC + ( sc * N ) );
					dgemm( 'transpose', 'no-transpose', n2, n1, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * N, offsetC + ( sc * n1 ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// C(N2+1) => offset N2, LDA=N
					dsyrk( 'lower', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * N, offsetC + ( sc * n2 ) );
					// C(N1+1) => offset N1, LDA=N  (note: Fortran uses A(N2,1) which is row index N2, i.e. 0-based N2-1)
					dsyrk( 'upper', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * ( n2 - 1 ) ), beta, C, sc, sc * N, offsetC + ( sc * n1 ) );
					// C(1) => offset 0, LDA=N
					dgemm( 'no-transpose', 'transpose', n1, n2, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * ( n2 - 1 ) ), beta, C, sc, sc * N, offsetC );
				} else {
					// TRANS = 'T'
					dsyrk( 'lower', 'transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * N, offsetC + ( sc * n2 ) );
					// Fortran: A(1, N2) => col N2, 0-based col N2-1
					dsyrk( 'upper', 'transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * ( n2 - 1 ) ), beta, C, sc, sc * N, offsetC + ( sc * n1 ) );
					dgemm( 'transpose', 'no-transpose', n1, n2, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * ( n2 - 1 ) ), beta, C, sc, sc * N, offsetC );
				}
			}
		} else {
			// TRANSR = 'T', transpose RFP, LDA = N1
			if ( lower ) {
				// UPLO = 'L'
				if ( notrans ) {
					// C(1) => offset 0, LDA=N1
					dsyrk( 'upper', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * n1, offsetC );
					// C(2) => offset 1, LDA=N1
					dsyrk( 'lower', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sc, sc * n1, offsetC + sc );
					// C(N1*N1+1) => offset N1*N1, LDA=N1
					dgemm( 'no-transpose', 'transpose', n1, n2, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sc, sc * n1, offsetC + ( sc * n1 * n1 ) );
				} else {
					// TRANS = 'T'
					dsyrk( 'upper', 'transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * n1, offsetC );
					dsyrk( 'lower', 'transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sc, sc * n1, offsetC + sc );
					dgemm( 'transpose', 'no-transpose', n1, n2, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sc, sc * n1, offsetC + ( sc * n1 * n1 ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// C(N2*N2+1) => offset N2*N2, LDA=N2
					dsyrk( 'upper', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * n2, offsetC + ( sc * n2 * n2 ) );
					// C(N1*N2+1) => offset N1*N2, LDA=N2
					dsyrk( 'lower', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sc, sc * n2, offsetC + ( sc * n1 * n2 ) );
					// C(1) => offset 0, LDA=N2
					dgemm( 'no-transpose', 'transpose', n2, n1, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * n2, offsetC );
				} else {
					// TRANS = 'T'
					dsyrk( 'upper', 'transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * n2, offsetC + ( sc * n2 * n2 ) );
					dsyrk( 'lower', 'transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sc, sc * n2, offsetC + ( sc * n1 * n2 ) );
					dgemm( 'transpose', 'no-transpose', n2, n1, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * n2, offsetC );
				}
			}
		}
	} else {
		// N is even
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N+1
			if ( lower ) {
				// UPLO = 'L'
				if ( notrans ) {
					// C(2) => offset 1, LDA=N+1
					dsyrk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * ( N + 1 ), offsetC + sc );
					// C(1) => offset 0, LDA=N+1
					dsyrk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sc, sc * ( N + 1 ), offsetC );
					// C(NK+2) => offset NK+1, LDA=N+1
					dgemm( 'no-transpose', 'transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * ( N + 1 ), offsetC + ( sc * ( nk + 1 ) ) );
				} else {
					// TRANS = 'T'
					dsyrk( 'lower', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * ( N + 1 ), offsetC + sc );
					dsyrk( 'upper', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sc, sc * ( N + 1 ), offsetC );
					dgemm( 'transpose', 'no-transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * ( N + 1 ), offsetC + ( sc * ( nk + 1 ) ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// C(NK+2) => offset NK+1, LDA=N+1
					dsyrk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * ( N + 1 ), offsetC + ( sc * ( nk + 1 ) ) );
					// C(NK+1) => offset NK, LDA=N+1
					dsyrk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sc, sc * ( N + 1 ), offsetC + ( sc * nk ) );
					// C(1) => offset 0, LDA=N+1
					dgemm( 'no-transpose', 'transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sc, sc * ( N + 1 ), offsetC );
				} else {
					// TRANS = 'T'
					dsyrk( 'lower', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * ( N + 1 ), offsetC + ( sc * ( nk + 1 ) ) );
					dsyrk( 'upper', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sc, sc * ( N + 1 ), offsetC + ( sc * nk ) );
					dgemm( 'transpose', 'no-transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sc, sc * ( N + 1 ), offsetC );
				}
			}
		} else {
			// TRANSR = 'T', transpose RFP, LDA = NK = N/2
			if ( lower ) {
				// UPLO = 'L'
				if ( notrans ) {
					// C(NK+1) => offset NK, LDA=NK
					dsyrk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * nk, offsetC + ( sc * nk ) );
					// C(1) => offset 0, LDA=NK
					dsyrk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sc, sc * nk, offsetC );
					// C((NK+1)*NK+1) => offset (NK+1)*NK, LDA=NK
					dgemm( 'no-transpose', 'transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sc, sc * nk, offsetC + ( sc * ( nk + 1 ) * nk ) );
				} else {
					// TRANS = 'T'
					dsyrk( 'upper', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * nk, offsetC + ( sc * nk ) );
					dsyrk( 'lower', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sc, sc * nk, offsetC );
					dgemm( 'transpose', 'no-transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sc, sc * nk, offsetC + ( sc * ( nk + 1 ) * nk ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// C(NK*(NK+1)+1) => offset NK*(NK+1), LDA=NK
					dsyrk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * nk, offsetC + ( sc * nk * ( nk + 1 ) ) );
					// C(NK*NK+1) => offset NK*NK, LDA=NK
					dsyrk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sc, sc * nk, offsetC + ( sc * nk * nk ) );
					// C(1) => offset 0, LDA=NK
					dgemm( 'no-transpose', 'transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * nk, offsetC );
				} else {
					// TRANS = 'T'
					dsyrk( 'upper', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sc, sc * nk, offsetC + ( sc * nk * ( nk + 1 ) ) );
					dsyrk( 'lower', 'transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sc, sc * nk, offsetC + ( sc * nk * nk ) );
					dgemm( 'transpose', 'no-transpose', nk, nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), A, strideA1, strideA2, offsetA, beta, C, sc, sc * nk, offsetC );
				}
			}
		}
	}

	return C;
}


// EXPORTS //

export default dsfrk;
