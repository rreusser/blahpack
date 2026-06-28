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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlanhb from '../../zlanhb/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zhbtrd from '../../zhbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import zsteqr from '../../zsteqr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A.
*
* The eigenvalues are returned in ascending order. If eigenvectors are
* requested, the matrix Z is filled with the orthonormal eigenvectors.
*
* The algorithm scales the matrix if needed, reduces to tridiagonal form
* via zhbtrd, computes eigenvalues via dsterf (or zsteqr when eigenvectors
* are requested), and rescales if necessary.
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Complex128Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output matrix for eigenvectors (N-by-N)
* @param {integer} strideZ1 - stride of the first (row) dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second (column) dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
* @param {Complex128Array} WORK - complex workspace array (length >= N)
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if dsteqr/dsterf did not converge
*/
function zhbev( jobz, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var smlnum;
	var indrwk;
	var safmin;
	var bignum;
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
	var ABv;
	var eps;
	var Zv;

	wantz = ( jobz === 'compute-vectors' );
	lower = ( uplo === 'lower' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		// Extract the real part of the diagonal element
		ABv = reinterpret( AB, 0 );
		if ( lower ) {
			w[ offsetW ] = ABv[ offsetAB * 2 ];
		} else {
			w[ offsetW ] = ABv[ ( offsetAB + ( kd * strideAB1 ) ) * 2 ];
		}
		if ( wantz ) {
			Zv = reinterpret( Z, 0 );
			Zv[ offsetZ * 2 ] = 1.0;
			Zv[ ( offsetZ * 2 ) + 1 ] = 0.0;
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
	anrm = zlanhb( 'max', uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, offsetRWork );
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
			zlascl( 'lower-band', kd, kd, 1.0, sigma, N, N, AB, strideAB1, strideAB2, offsetAB );
		} else {
			zlascl( 'upper-band', kd, kd, 1.0, sigma, N, N, AB, strideAB1, strideAB2, offsetAB );
		}
	}

	// Partition RWORK: E at INDE, scratch for zsteqr at INDRWK
	// Fortran: INDE=1, INDRWK=INDE+N (1-based)
	// JS (0-based): inde=offsetRWork, indrwk=offsetRWork + N*strideRWork
	inde = offsetRWork;
	indrwk = offsetRWork + ( N * strideRWork );

	// Reduce to tridiagonal form via zhbtrd (when wantz, pass 'initialize' to form Q from identity; otherwise 'none'):
	zhbtrd( ( ( wantz ) ? 'initialize' : 'none' ), uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, RWORK, strideRWork, inde, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork );

	// Compute eigenvalues (and eigenvectors)...
	if ( wantz ) {
		// Z now contains Q from zhbtrd; zsteqr updates it
		info = zsteqr( 'update', N, w, strideW, offsetW, RWORK, strideRWork, inde, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWork, indrwk );
	} else {
		// Eigenvalues only
		info = dsterf( N, w, strideW, offsetW, RWORK, strideRWork, inde );
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

export default zhbev;
