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

import dpptrf from '../../dpptrf/lib/base.js';
import dspgst from '../../dspgst/lib/base.js';
import dspev from '../../dspev/lib/base.js';
import dtpsv from '../../../../blas/base/dtpsv/lib/base.js';
import dtpmv from '../../../../blas/base/dtpmv/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real generalized symmetric-definite eigenproblem in packed storage.
*
* ## Notes
*
* -   If itype = 1: A_x = lambda_B_x
* -   If itype = 2: A_B_x = lambda_x
* -   If itype = 3: B_A_x = lambda_x
*
* A and B are assumed to be symmetric, stored in packed format,
* and B is also positive definite.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` (eigenvalues only) or `'compute-vectors'` (eigenvalues + eigenvectors)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} AP - packed symmetric matrix A; on exit, overwritten
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} BP - packed symmetric positive definite matrix B; on exit, Cholesky factor
* @param {integer} strideBP - stride length for `BP`
* @param {NonNegativeInteger} offsetBP - starting index for `BP`
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Z - output eigenvector matrix (N x N); referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 3*N)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} info - 0 if successful, >0 if dpptrf or dspev failed
*/
function dspgv( itype, jobz, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
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
	info = dpptrf( uplo, N, BP, strideBP, offsetBP );
	if ( info !== 0 ) {
		// Return N + info to indicate B is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem and solve
	dspgst( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP );
	info = dspev( jobz, uplo, N, AP, strideAP, offsetAP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork );

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
			for ( j = 0; j < neig; j++ ) {
				dtpsv( uplo, trans, 'non-unit', N, BP, strideBP, offsetBP, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
		} else if ( itype === 3 ) {
			// For B*A*x = lambda*x:
			// Backtransform eigenvectors: x = L*y or U^T*y
			if ( upper ) {
				trans = 'transpose';
			} else {
				trans = 'no-transpose';
			}
			for ( j = 0; j < neig; j++ ) {
				dtpmv( uplo, trans, 'non-unit', N, BP, strideBP, offsetBP, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
		}
	}

	return info;
}


// EXPORTS //

export default dspgv;
