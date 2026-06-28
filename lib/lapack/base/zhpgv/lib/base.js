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

import zpptrf from '../../zpptrf/lib/base.js';
import zhpgst from '../../zhpgst/lib/base.js';
import zhpev from '../../zhpev/lib/base.js';
import ztpsv from '../../../../blas/base/ztpsv/lib/base.js';
import ztpmv from '../../../../blas/base/ztpmv/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem in packed storage.
*
* ## Notes
*
* -   If itype = 1: A_x = lambda_B*x
* -   If itype = 2: A_B_x = lambda*x
* -   If itype = 3: B_A_x = lambda*x
*
* A and B are assumed to be Hermitian, stored in packed format,
* and B is also positive definite.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` (eigenvalues only) or `'compute-vectors'` (eigenvalues + eigenvectors)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - packed Hermitian matrix A; on exit, overwritten
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} BP - packed Hermitian positive definite matrix B; on exit, Cholesky factor
* @param {integer} strideBP - stride length for `BP` (in complex elements)
* @param {NonNegativeInteger} offsetBP - starting index for `BP` (in complex elements)
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Complex128Array} Z - output eigenvector matrix (N x N); referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
* @param {Complex128Array} WORK - complex workspace array (length >= max(1, 2*N-1))
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} info - 0 if successful, >0 if zpptrf or zhpev failed
*/
function zhpgv( itype, jobz, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var wantz;
	var upper;
	var trans;
	var neig;
	var info;
	var j;

	wantz = ( jobz === 'compute-vectors' );
	upper = ( uplo === 'upper' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// Form a Cholesky factorization of B
	info = zpptrf( uplo, N, BP, strideBP, offsetBP );
	if ( info !== 0 ) {
		// Return N + info to indicate B is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem and solve
	zhpgst( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP );
	info = zhpev( ( wantz ) ? 'compute-vectors' : 'no-vectors', uplo, N, AP, strideAP, offsetAP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	if ( wantz ) {
		// Backtransform eigenvectors to the original problem
		neig = N;
		if ( info > 0 ) {
			neig = info - 1;
		}
		if ( itype === 1 || itype === 2 ) {
			// For A*x = lambda*B*x and A*B*x = lambda*x:
			// Backtransform eigenvectors: x = inv(L)^H * y or inv(U) * y
			if ( upper ) {
				trans = 'no-transpose';
			} else {
				trans = 'conjugate-transpose';
			}
			for ( j = 0; j < neig; j++ ) {
				ztpsv( uplo, trans, 'non-unit', N, BP, strideBP, offsetBP, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
		} else if ( itype === 3 ) {
			// For B*A*x = lambda*x:
			// Backtransform eigenvectors: x = L*y or U^H*y
			if ( upper ) {
				trans = 'conjugate-transpose';
			} else {
				trans = 'no-transpose';
			}
			for ( j = 0; j < neig; j++ ) {
				ztpmv( uplo, trans, 'non-unit', N, BP, strideBP, offsetBP, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
		}
	}

	return info;
}


// EXPORTS //

export default zhpgv;
