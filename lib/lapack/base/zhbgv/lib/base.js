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

import zpbstf from '../../zpbstf/lib/base.js';
import zhbgst from '../../zhbgst/lib/base.js';
import zhbtrd from '../../zhbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import zsteqr from '../../zsteqr/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite banded eigenproblem A_x = lambda_B_x.
*
* A and B are assumed to be Hermitian and banded, and B is also positive definite.
*
* ## Algorithm
*
* 1.  Form a split Cholesky factorization of B via zpbstf.
* 2.  Transform to standard eigenvalue problem via zhbgst.
* 3.  Reduce to real tridiagonal form via zhbtrd.
* 4.  Compute eigenvalues via dsterf, or eigenvalues and eigenvectors via zsteqr.
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {integer} ka - number of super- (or sub-) diagonals of A
* @param {integer} kb - number of super- (or sub-) diagonals of B
* @param {Complex128Array} AB - band matrix A in band storage, dimension (ka+1, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Complex128Array} BB - band matrix B in band storage, dimension (kb+1, N)
* @param {integer} strideBB1 - stride of the first dimension of `BB` (in complex elements)
* @param {integer} strideBB2 - stride of the second dimension of `BB` (in complex elements)
* @param {NonNegativeInteger} offsetBB - starting index for `BB` (in complex elements)
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Complex128Array} Z - output matrix for eigenvectors (N-by-N), referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
* @param {Complex128Array} WORK - complex workspace array (length >= N)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= 3*N)
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} info - 0 if successful; if > 0 and <= N, dsteqr/dsterf did not converge; if > N, zpbstf returned info = info - N (B is not positive definite).
*/
function zhbgv( jobz, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var indwrk;
	var wantz;
	var inde;
	var info;
	var vect;

	wantz = ( jobz === 'compute-vectors' );

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	// Form a split Cholesky factorization of B:
	info = zpbstf( uplo, N, kb, BB, strideBB1, strideBB2, offsetBB );
	if ( info !== 0 ) {
		return N + info;
	}

	// Partition RWORK: e at inde, scratch at indwrk
	inde = offsetRWork;
	indwrk = offsetRWork + ( N * strideRWork );

	// Transform problem to standard eigenvalue problem:
	zhbgst( ( (wantz) ? 'update' : 'none' ), uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, indwrk );

	// Reduce to tridiagonal form:
	if ( wantz ) {
		vect = 'update';
	} else {
		vect = 'none';
	}
	zhbtrd( vect, uplo, N, ka, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, RWORK, strideRWork, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork );

	// Compute eigenvalues (and eigenvectors if requested):
	if ( wantz ) {
		info = zsteqr( 'update', N, w, strideW, offsetW, RWORK, strideRWork, inde, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWork, indwrk );
	} else {
		info = dsterf( N, w, strideW, offsetW, RWORK, strideRWork, inde );
	}

	return info;
}


// EXPORTS //

export default zhbgv;
