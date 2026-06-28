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

import zpptrf from '../../zpptrf/lib/base.js';
import zhpgst from '../../zhpgst/lib/base.js';
import zhpevx from '../../zhpevx/lib/base.js';
import ztpsv from '../../../../blas/base/ztpsv/lib/base.js';
import ztpmv from '../../../../blas/base/ztpmv/lib/base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian-definite generalized eigenproblem in packed storage.
*
* ## Notes
*
* -   If itype = 1: A\_x = lambda\_B\_x
* -   If itype = 2: A\_B\_x = lambda\_x
* -   If itype = 3: B\_A\_x = lambda\_x
*
* A and B are assumed to be Hermitian, stored in packed format,
* and B is also positive definite.
*
* Eigenvalues and eigenvectors can be selected by specifying a range of
* values (range='value') or a range of indices (range='index') for the
* desired eigenvalues.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` (eigenvalues only) or `'compute-vectors'` (eigenvalues + eigenvectors)
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - packed Hermitian matrix A; on exit, overwritten
* @param {integer} strideAP - stride length for `AP` (complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (complex elements)
* @param {Complex128Array} BP - packed Hermitian positive definite matrix B; on exit, Cholesky factor
* @param {integer} strideBP - stride length for `BP` (complex elements)
* @param {NonNegativeInteger} offsetBP - starting index for `BP` (complex elements)
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Complex128Array} Z - output eigenvector matrix (N x M); referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @param {Complex128Array} WORK - complex workspace array (length >= 2*N)
* @param {integer} strideWork - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= 7*N)
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for `IFAIL`
* @param {NonNegativeInteger} offsetIFAIL - starting index for `IFAIL`
* @returns {integer} info - 0 if successful, >0 if zpptrf or zhpevx failed
*/
function zhpgvx( itype, jobz, range, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) {
	var wantz;
	var upper;
	var trans;
	var info;
	var M;
	var j;

	wantz = ( jobz === 'compute-vectors' );
	upper = ( uplo === 'upper' );

	// Quick return if possible
	out.M = 0;
	if ( N === 0 ) {
		return 0;
	}

	// Form a Cholesky factorization of B
	info = zpptrf( uplo, N, BP, strideBP, offsetBP );
	if ( info !== 0 ) {
		// Return N + info to indicate B is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem
	zhpgst( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP );

	// Solve the standard eigenvalue problem
	info = zhpevx( jobz, range, uplo, N, AP, strideAP, offsetAP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len

	if ( wantz ) {
		// Backtransform eigenvectors to the original problem
		M = out.M;
		if ( info > 0 ) {
			M = info - 1;
		}
		if ( itype === 1 || itype === 2 ) {
			// For A*x = lambda*B*x and A*B*x = lambda*x:
			// Backtransform eigenvectors: x = inv(L)**H * y or inv(U) * y
			if ( upper ) {
				trans = 'no-transpose';
			} else {
				trans = 'conjugate-transpose';
			}
			for ( j = 0; j < M; j++ ) {
				ztpsv( uplo, trans, 'non-unit', N, BP, strideBP, offsetBP, Z, strideZ1, offsetZ + ( j * strideZ2 ) ); // eslint-disable-line max-len
			}
		} else if ( itype === 3 ) {
			// For B*A*x = lambda*x:
			// Backtransform eigenvectors: x = L*y or U**H*y
			if ( upper ) {
				trans = 'conjugate-transpose';
			} else {
				trans = 'no-transpose';
			}
			for ( j = 0; j < M; j++ ) {
				ztpmv( uplo, trans, 'non-unit', N, BP, strideBP, offsetBP, Z, strideZ1, offsetZ + ( j * strideZ2 ) ); // eslint-disable-line max-len
			}
		}
	}

	return info;
}


// EXPORTS //

export default zhpgvx;
