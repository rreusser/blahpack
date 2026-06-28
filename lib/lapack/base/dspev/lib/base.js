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

import dlamch from '../../dlamch/lib/base.js';
import dlansp from '../../dlansp/lib/base.js';
import dsptrd from '../../dsptrd/lib/base.js';
import dopgtr from '../../dopgtr/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
* matrix A in packed storage.
*
* The eigenvalues are returned in ascending order. If eigenvectors are
* requested (jobz = `'compute-vectors'`), the orthonormal eigenvectors are stored
* column-wise in Z.
*
* ## Algorithm
*
* -   Scale the matrix if the norm is outside safe range.
* -   Reduce to tridiagonal form via dsptrd.
* -   If eigenvalues only: compute via dsterf.
* -   If eigenvectors too: generate Q via dopgtr, then dsteqr.
* -   Undo scaling on eigenvalues if needed.
*
* @private
* @param {string} jobz - `'no-vectors'` (eigenvalues only) or `'compute-vectors'` (eigenvalues + eigenvectors)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix; on exit, overwritten by dsptrd
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
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
* @returns {integer} info - 0 if successful, >0 if dsteqr/dsterf did not converge
*/
function dspev( jobz, uplo, N, AP, strideAP, offsetAP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
	var safmin;
	var smlnum;
	var bignum;
	var iscale;
	var indtau;
	var indwrk;
	var wantz;
	var sigma;
	var anrm;
	var rmin;
	var rmax;
	var info;
	var imax;
	var inde;
	var eps;

	wantz = ( jobz === 'compute-vectors' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		w[ offsetW ] = AP[ offsetAP ];
		if ( wantz ) {
			Z[ offsetZ ] = 1.0;
		}
		return 0;
	}

	// Get machine constants
	safmin = dlamch( 'safe-minimum' );
	eps = dlamch( 'epsilon' );
	smlnum = safmin / eps;
	bignum = 1.0 / smlnum;
	rmin = Math.sqrt( smlnum );
	rmax = Math.sqrt( bignum );

	// Scale matrix to allowable range, if necessary
	anrm = dlansp( 'max', uplo, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork );
	iscale = 0;
	sigma = 1.0;
	if ( anrm > 0.0 && anrm < rmin ) {
		iscale = 1;
		sigma = rmin / anrm;
	} else if ( anrm > rmax ) {
		iscale = 1;
		sigma = rmax / anrm;
	}
	if ( iscale === 1 ) {
		dscal( ( N * ( N + 1 ) ) / 2, sigma, AP, strideAP, offsetAP );
	}

	// Partition WORK into E, TAU, and scratch segments
	// Fortran: INDE=1, INDTAU=INDE+N
	// JS (0-based): inde=offsetWork, indtau=offsetWork + N*strideWork
	inde = offsetWork;
	indtau = inde + ( N * strideWork );

	// Reduce to tridiagonal form: Q^T * A * Q = T

	// D (diagonal) goes into w, E (off-diagonal) into WORK[inde], TAU into WORK[indtau]
	dsptrd( uplo, N, AP, strideAP, offsetAP, w, strideW, offsetW, WORK, strideWork, inde, WORK, strideWork, indtau );

	info = 0;
	if ( wantz ) {
		// Generate orthogonal matrix Q from dsptrd output
		indwrk = indtau + ( N * strideWork );
		dopgtr( uplo, N, AP, strideAP, offsetAP, WORK, strideWork, indtau, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indwrk );

		// Compute eigenvalues and eigenvectors of the tridiagonal matrix; dsteqr 'update' means Z already contains Q, update it in-place; reuse WORK[indtau] as scratch workspace for dsteqr (needs 2*(N-1) space)...
		info = dsteqr( 'update', N, w, strideW, offsetW, WORK, strideWork, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indtau );
	} else {
		// Eigenvalues only...
		info = dsterf( N, w, strideW, offsetW, WORK, strideWork, inde );
	}

	// If matrix was scaled, rescale eigenvalues
	if ( iscale === 1 ) {
		if ( info === 0 ) {
			imax = N;
		} else {
			imax = info - 1;
		}
		dscal( imax, 1.0 / sigma, w, strideW, offsetW );
	}

	return info;
}


// EXPORTS //

export default dspev;
