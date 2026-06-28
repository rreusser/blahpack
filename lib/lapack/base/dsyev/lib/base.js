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
import dlansy from '../../dlansy/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dsytrd from '../../dsytrd/lib/base.js';
import dorgtr from '../../dorgtr/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
* matrix A.
*
* The eigenvalues are returned in ascending order. If eigenvectors are
* requested (JOBZ = 'V'), the matrix A is overwritten with the orthonormal
* eigenvectors.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via dsytrd
* 3. If eigenvalues only (jobz=`'no-vectors'`): compute via dsterf
* If eigenvectors too (jobz=`'compute-vectors'`): generate Q via dorgtr, then dsteqr
* 4. Undo scaling on eigenvalues if needed
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix; on exit contains eigenvectors if jobz=`'compute-vectors'`
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful, >0 if dsteqr/dsterf did not converge
*/
function dsyev( jobz, uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, WORK, strideWork, offsetWork ) {
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
		w[ offsetW ] = A[ offsetA ];
		if ( wantz ) {
			A[ offsetA ] = 1.0;
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
	anrm = dlansy( 'max', uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
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
		dlascl( uplo, 0, 0, 1.0, sigma, N, N, A, strideA1, strideA2, offsetA );
	}

	// Partition WORK into E, TAU, and scratch segments
	// Fortran: INDE=1, INDTAU=INDE+N, INDWRK=INDTAU+N
	// JS (0-based): inde=0, indtau=N, indwrk=2*N
	inde = offsetWork;
	indtau = inde + (N * strideWork);
	indwrk = indtau + (N * strideWork);

	// Reduce to tridiagonal form: Q^T * A * Q = T

	// dsytrd(uplo, N, A, sa1, sa2, oA, d, sd, od, e, se, oe, TAU, sTAU, oTAU )

	// D (diagonal) goes into w, e (off-diagonal) into WORK[inde], TAU into WORK[indtau]
	dsytrd(uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, WORK, strideWork, inde, WORK, strideWork, indtau );

	info = 0;
	if ( wantz ) {
		// Generate orthogonal matrix Q from dsytrd output
		dorgtr(uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWork, indtau, WORK, strideWork, indwrk );

		// Compute eigenvalues and eigenvectors of the tridiagonal matrix

		// Dsteqr uses WORK[indtau] as its scratch workspace (needs 2*(N-1) space)
		info = dsteqr( 'update', N, w, strideW, offsetW, WORK, strideWork, inde, A, strideA1, strideA2, offsetA, WORK, strideWork, indtau );
	} else {
		// Eigenvalues only — use dsterf on the tridiagonal
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

export default dsyev;
