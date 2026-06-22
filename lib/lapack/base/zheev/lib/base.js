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
import zlanhe from '../../zlanhe/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zhetrd from '../../zhetrd/lib/base.js';
import zungtr from '../../zungtr/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import zsteqr from '../../zsteqr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex Hermitian.
* matrix A.
*
* The eigenvalues are returned in ascending order. If eigenvectors are
* requested (JOBZ = 'V'), the matrix A is overwritten with the unitary
* eigenvector matrix.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via zhetrd
* 3. If jobz=`'no-vectors'`: compute eigenvalues only (dsterf)
* If jobz=`'compute-vectors'`: generate Q via zungtr, then eigenvalues+eigenvectors (zsteqr)
* 4. Undo scaling on eigenvalues if needed
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix; on exit contains eigenvectors if jobz=`'compute-vectors'`
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - length of WORK array (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if zsteqr/dsterf did not converge
*/
function zheev( jobz, uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) {
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
	var Av;
	var oA;

	/* @complex-arrays A, WORK */

	wantz = ( jobz === 'compute-vectors' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		// For N=1, eigenvalue = real part of A(0,0)
		Av = reinterpret( A, 0 );
		oA = offsetA * 2;
		w[ offsetW ] = Av[ oA ];
		if ( wantz ) {
			Av[ oA ] = 1.0;
			Av[ oA + 1 ] = 0.0;
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
	// Zlanhe returns a real value; RWORK is used as workspace for the norm computation
	anrm = zlanhe( 'max', uplo, N, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, offsetRWORK );
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
		zlascl( uplo, 0, 0, 1.0, sigma, N, N, A, strideA1, strideA2, offsetA );
	}

	// Partition WORK (complex) into TAU and scratch segments
	// Fortran: INDTAU=1, INDWRK=INDTAU+N => TAU is at WORK[0..N-1], scratch at WORK[N..]
	// Partition RWORK (real) into E segment
	// Fortran: INDE=1 => E is at RWORK[0..N-1]
	inde = offsetRWORK;
	indtau = offsetWORK;
	indwrk = offsetWORK + (N * strideWORK);

	// Reduce to tridiagonal form: Q^H * A * Q = T

	// zhetrd(uplo, N, A, sa1, sa2, oA, d, sd, od, e, se, oe, TAU, sTAU, oTAU )

	// D (diagonal, real) goes into w, e (off-diagonal, real) into RWORK[inde], TAU (complex) into WORK[indtau]
	zhetrd(uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, RWORK, strideRWORK, inde, WORK, strideWORK, indtau );

	info = 0;
	if ( wantz ) {
		// Generate unitary matrix Q from zhetrd output
		zungtr(uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, indtau, WORK, strideWORK, indwrk );

		// Compute eigenvalues and eigenvectors of the tridiagonal matrix

		// Zsteqr needs real workspace of size 2*(N-1), use RWORK starting after E
		// Fortran: INDWRK=INDE+N => real scratch at RWORK[N..]
		info = zsteqr( 'update', N, w, strideW, offsetW, RWORK, strideRWORK, inde, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, inde + (N * strideRWORK) );
	} else {
		// Eigenvalues only - use dsterf on the tridiagonal
		info = dsterf( N, w, strideW, offsetW, RWORK, strideRWORK, inde );
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

export default zheev;
