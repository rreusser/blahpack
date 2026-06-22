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

import dlamch from '../../dlamch/lib/base.js';
import dlansb from '../../dlansb/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dsbtrd from '../../dsbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric band matrix A.
*
* The eigenvalues are returned in ascending order. If eigenvectors are
* requested, the matrix Z is filled with the orthonormal eigenvectors.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via dsbtrd
* 3. If eigenvalues only (jobz=`'no-vectors'`): compute via dsterf
*    If eigenvectors too (jobz=`'compute-vectors'`): dsteqr with Z from dsbtrd
* 4. Undo scaling on eigenvalues if needed
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Float64Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB`
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} Z - output matrix for eigenvectors (N-by-N)
* @param {integer} strideZ1 - stride of the first (row) dimension of `Z`
* @param {integer} strideZ2 - stride of the second (column) dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= max(1, 3*N-2))
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful, >0 if dsteqr/dsterf did not converge
*/
function dsbev( jobz, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ) {
	var safmin;
	var smlnum;
	var bignum;
	var indwrk;
	var iscale;
	var wantz;
	var lower;
	var sigma;
	var anrm;
	var rmin;
	var rmax;
	var info;
	var imax;
	var inde;
	var eps;

	wantz = ( jobz === 'compute-vectors' );
	lower = ( uplo === 'lower' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		if ( lower ) {
			w[ offsetW ] = AB[ offsetAB ];
		} else {
			w[ offsetW ] = AB[ offsetAB + ( kd * strideAB1 ) ];
		}
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
	anrm = dlansb( 'max', uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWORK, offsetWORK );
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
		if ( lower ) {
			dlascl( 'lower-band', kd, kd, 1.0, sigma, N, N, AB, strideAB1, strideAB2, offsetAB );
		} else {
			dlascl( 'upper-band', kd, kd, 1.0, sigma, N, N, AB, strideAB1, strideAB2, offsetAB );
		}
	}

	// Partition WORK: E at INDE, scratch at INDWRK
	// Fortran: INDE=1, INDWRK=INDE+N (1-based)
	// JS (0-based): inde=offsetWORK, indwrk=offsetWORK + N*strideWORK
	inde = offsetWORK;
	indwrk = offsetWORK + ( N * strideWORK );

	// Reduce to tridiagonal form: dsbtrd

	// When wantz, pass 'initialize' to form Q from identity; otherwise 'none'
	dsbtrd( ( ( wantz ) ? 'initialize' : 'none' ), uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, WORK, strideWORK, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk );

	// Compute eigenvalues (and eigenvectors)
	if ( wantz ) {
		// Z now contains Q from dsbtrd; dsteqr updates it
		info = dsteqr( 'update', N, w, strideW, offsetW, WORK, strideWORK, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk );
	} else {
		// Eigenvalues only
		info = dsterf( N, w, strideW, offsetW, WORK, strideWORK, inde );
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

export default dsbev;
