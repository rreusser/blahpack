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

import dpbstf from '../../dpbstf/lib/base.js';
import dsbgst from '../../dsbgst/lib/base.js';
import dsbtrd from '../../dsbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real generalized symmetric-definite banded eigenproblem A_x = lambda_B_x.
*
* A and B are assumed to be symmetric and banded, and B is also positive definite.
*
* ## Algorithm
*
* 1.  Form a split Cholesky factorization of B via dpbstf.
* 2.  Transform to standard eigenvalue problem via dsbgst.
* 3.  Reduce to tridiagonal form via dsbtrd.
* 4.  Compute eigenvalues via dsterf, or eigenvalues and eigenvectors via dsteqr.
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {integer} ka - number of super- (or sub-) diagonals of A
* @param {integer} kb - number of super- (or sub-) diagonals of B
* @param {Float64Array} AB - band matrix A in band storage, dimension (ka+1, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} BB - band matrix B in band storage, dimension (kb+1, N)
* @param {integer} strideBB1 - stride of the first dimension of `BB`
* @param {integer} strideBB2 - stride of the second dimension of `BB`
* @param {NonNegativeInteger} offsetBB - starting index for `BB`
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Z - output matrix for eigenvectors (N-by-N), referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 3*N)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} info - 0 if successful; if > 0 and <= N, dsteqr/dsterf did not converge; if > N, dpbstf returned info = info - N (B is not positive definite).
*/
function dsbgv( jobz, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
	var indwrk;
	var wantz;
	var inde;
	var info;
	var vect;

	wantz = ( jobz === 'compute-vectors' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// Form a split Cholesky factorization of B
	info = dpbstf( uplo, N, kb, BB, strideBB1, strideBB2, offsetBB );
	if ( info !== 0 ) {
		return N + info;
	}

	// Partition WORK: e at inde, scratch at indwrk
	inde = offsetWork;
	indwrk = offsetWork + ( N * strideWork );

	// Transform problem to standard eigenvalue problem
	dsbgst( ( (wantz) ? 'update' : 'none' ), uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indwrk );

	// Reduce to tridiagonal form
	if ( wantz ) {
		vect = 'update';
	} else {
		vect = 'none';
	}
	dsbtrd( vect, uplo, N, ka, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, WORK, strideWork, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indwrk );

	// Compute eigenvalues (and eigenvectors if requested)
	if ( wantz ) {
		info = dsteqr( 'update', N, w, strideW, offsetW, WORK, strideWork, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indwrk );
	} else {
		info = dsterf( N, w, strideW, offsetW, WORK, strideWork, inde );
	}

	return info;
}


// EXPORTS //

export default dsbgv;
