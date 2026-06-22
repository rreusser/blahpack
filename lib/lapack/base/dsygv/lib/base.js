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

import dpotrf from '../../dpotrf/lib/base.js';
import dsygst from '../../dsygst/lib/base.js';
import dsyev from '../../dsyev/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Computes all the eigenvalues, and optionally, the eigenvectors of a real.
* generalized symmetric-definite eigenproblem:
*   A_x = lambda_B_x  (itype=1)
_   A_B_x = lambda_x  (itype=2)
*   B_A_x = lambda*x  (itype=3)
*
* Here A and B are assumed to be symmetric and B is also positive definite.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - 'compute-vectors' for eigenvalues and eigenvectors, 'no-vectors' for eigenvalues only
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input/output symmetric matrix; on exit, eigenvectors if jobz='compute-vectors'
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - symmetric positive definite matrix; on exit, Cholesky factor
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} WORK - workspace array (length >= max(1, 3*N-1))
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK array
* @returns {integer} info - 0 if successful, >0 if dpotrf or dsyev failed
*/
function dsygv( itype, jobz, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, w, strideW, offsetW, WORK, strideWORK, offsetWORK, lwork ) {
	var wantz;
	var upper;
	var trans;
	var neig;
	var info;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	wantz = ( jobz === 'compute-vectors' );
	upper = ( uplo === 'upper' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	// Form a Cholesky factorization of B
	info = dpotrf( uplo, N, B, sb1, sb2, offsetB );
	if ( info !== 0 ) {
		// Return N + info to indicate B is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem and solve
	dsygst( itype, uplo, N, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );
	info = dsyev( jobz, uplo, N, A, sa1, sa2, offsetA, w, strideW, offsetW, WORK, strideWORK, offsetWORK );

	if ( wantz ) {
		// Backtransform eigenvectors to the original problem
		neig = N;
		if ( info > 0 ) {
			neig = info - 1;
		}
		if ( itype === 1 || itype === 2 ) {
			// For A*x = lambda*B*x and A*B*x = lambda*x:
			// Backtransform eigenvectors: x = inv(L)^T * y or inv(U) * y
			if ( upper ) {
				trans = 'no-transpose';
			} else {
				trans = 'transpose';
			}
			dtrsm( 'left', uplo, trans, 'non-unit', N, neig, 1.0, B, sb1, sb2, offsetB, A, sa1, sa2, offsetA);
		} else if ( itype === 3 ) {
			// For B*A*x = lambda*x:
			// Backtransform eigenvectors: x = L*y or U^T*y
			if ( upper ) {
				trans = 'transpose';
			} else {
				trans = 'no-transpose';
			}
			dtrmm( 'left', uplo, trans, 'non-unit', N, neig, 1.0, B, sb1, sb2, offsetB, A, sa1, sa2, offsetA);
		}
	}

	return info;
}


// EXPORTS //

export default dsygv;
