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

import dpotrf from '../../dpotrf/lib/base.js';
import dsygst from '../../dsygst/lib/base.js';
import dsyevx from '../../dsyevx/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Computes selected eigenvalues, and optionally, eigenvectors of a real.
* generalized symmetric-definite eigenproblem, of the form
* A_x=(lambda)_B_x, A_B_x=(lambda)_x, or B_A_x=(lambda)*x.
*
* Here A and B are assumed to be symmetric and B is also positive definite.
* Eigenvalues and eigenvectors can be selected by specifying either a range
* of values or a range of indices for the desired eigenvalues.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {integer} itype - problem type: 1 for A*x=lambda*B*x, 2 for A*B*x=lambda*x, 3 for B*A*x=lambda*x
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {Float64Array} A - input/output symmetric matrix A (destroyed on exit)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - input/output matrix B (overwritten with Cholesky factor)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} Z - output eigenvector matrix (N x M)
* @param {integer} strideZ1 - stride of first dimension of Z
* @param {integer} strideZ2 - stride of second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace array (length >= 8*N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @returns {integer} info - 0 if successful, >0 if dpotrf or dsyevx returned an error
*/
function dsygvx( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	var wantz;
	var upper;
	var trans;
	var info;
	var M;

	wantz = ( jobz === 'compute-vectors' );
	upper = ( uplo === 'upper' );

	// Quick return if possible
	out.M = 0;
	if ( N === 0 ) {
		return 0;
	}

	// Form a Cholesky factorization of B
	info = dpotrf( uplo, N, B, strideB1, strideB2, offsetB );
	if ( info !== 0 ) {
		// INFO = N + INFO: the leading principal minor of order INFO of B
		// Is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem and solve
	dsygst( itype, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
	info = dsyevx( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL );

	M = out.M;

	if ( wantz ) {
		// Backtransform eigenvectors to the original problem
		if ( info > 0 ) {
			M = info - 1;
		}

		if ( M > 0 ) {
			if ( itype === 1 || itype === 2 ) {
				// For A*x=(lambda)*B*x and A*B*x=(lambda)*x:
				// Backtransform eigenvectors: x = inv(L)^T*y or inv(U)*y
				if ( upper ) {
					trans = 'no-transpose';
				} else {
					trans = 'transpose';
				}
				dtrsm( 'left', uplo, trans, 'non-unit', N, M, 1.0, B, strideB1, strideB2, offsetB, Z, strideZ1, strideZ2, offsetZ );
			} else if ( itype === 3 ) {
				// For B*A*x=(lambda)*x:
				// Backtransform eigenvectors: x = L*y or U^T*y
				if ( upper ) {
					trans = 'transpose';
				} else {
					trans = 'no-transpose';
				}
				dtrmm( 'left', uplo, trans, 'non-unit', N, M, 1.0, B, strideB1, strideB2, offsetB, Z, strideZ1, strideZ2, offsetZ );
			}
		}
	}

	return info;
}


// EXPORTS //

export default dsygvx;
