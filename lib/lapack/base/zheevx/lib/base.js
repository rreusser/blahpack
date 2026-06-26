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

/* eslint-disable max-len, max-params, no-var, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlanhe from '../../zlanhe/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zhetrd from '../../zhetrd/lib/base.js';
import zungtr from '../../zungtr/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zsteqr from '../../zsteqr/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import zstein from '../../zstein/lib/base.js';
import zunmtr from '../../zunmtr/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var sqrt = Math.sqrt;
var min = Math.min;


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex.
* Hermitian matrix A.
*
* Eigenvalues and eigenvectors can be selected by specifying a range of values
* (RANGE='value') or a range of indices (RANGE='index') for the desired
* eigenvalues.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via zhetrd
* 3. If computing all eigenvalues with abstol <= 0:
*    - JOBZ='no-vectors': dsterf for eigenvalues only
*    - JOBZ='compute-vectors': zungtr + zsteqr for eigenvalues+eigenvectors
* 4. Otherwise (selective):
*    - dstebz for selected eigenvalues by bisection
*    - zstein for eigenvectors by inverse iteration (if JOBZ='compute-vectors')
*    - zunmtr to transform back to original space
* 5. Sort eigenvalues and eigenvectors, undo scaling
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output eigenvector matrix (N x N)
* @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - length of WORK
* @param {Float64Array} RWORK - real workspace (length >= 7*N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @returns {integer} info - 0 if successful, >0 if eigenvectors failed to converge
*/
function zheevx( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) {
	var alleig;
	var valeig;
	var indeig;
	var wantz;
	var lower;
	var safmin;
	var smlnum;
	var bignum;
	var iscale;
	var abstll;
	var sigma;
	var anrm;
	var rmin;
	var rmax;
	var info;
	var imax;
	var eps;
	var Av;
	var oA;

	// Workspace partitions
	var indd;
	var inde;
	var indrwk;
	var indee;
	var indtau;
	var indwrk;
	var llwork;

	// Dstebz outputs
	var Mout;
	var nsplit;
	var indibl;
	var indisp;
	var indiwk;
	var order;

	// Sorting variables
	var itmp1;
	var tmp1;

	// Loop variables
	var i;
	var j;
	var jj;
	var M;

	// Flag for fast path
	var test;

	/* @complex-arrays A, Z, WORK */

	wantz = ( jobz === 'compute-vectors' );
	alleig = ( range === 'all' );
	valeig = ( range === 'value' );
	indeig = ( range === 'index' );
	lower = ( uplo === 'lower' );

	info = 0;
	M = 0;

	// Quick return if possible
	if ( N === 0 ) {
		out.M = 0;
		return 0;
	}

	if ( N === 1 ) {
		Av = reinterpret( A, 0 );
		oA = offsetA * 2;
		if ( alleig || indeig ) {
			M = 1;
			w[ offsetW ] = Av[ oA ];
		} else if ( valeig ) {
			if ( vl < Av[ oA ] && vu >= Av[ oA ] ) {
				M = 1;
				w[ offsetW ] = Av[ oA ];
			}
		}
		if ( wantz && M === 1 ) {
			var Zv = reinterpret( Z, 0 );
			Zv[ offsetZ * 2 ] = 1.0;
			Zv[ ( offsetZ * 2 ) + 1 ] = 0.0;
		}
		out.M = M;
		return 0;
	}

	// Get machine constants
	safmin = dlamch( 'safe-minimum' );
	eps = dlamch( 'epsilon' );
	smlnum = safmin / eps;
	bignum = 1.0 / smlnum;
	rmin = sqrt( smlnum );
	rmax = min( sqrt( bignum ), 1.0 / sqrt( sqrt( safmin ) ) );

	// Scale matrix to allowable range, if necessary
	iscale = 0;
	abstll = abstol;
	var vll = vl;
	var vuu = vu;

	anrm = zlanhe( 'max', uplo, N, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, offsetRWORK );
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
			for ( j = 0; j < N; j++ ) {
				zdscal( N - j, sigma, A, strideA1, offsetA + ( j * strideA1 ) + ( j * strideA2 ) );
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				zdscal( j + 1, sigma, A, strideA1, offsetA + ( j * strideA2 ) );
			}
		}
		if ( abstol > 0.0 ) {
			abstll = abstol * sigma;
		}
		if ( valeig ) {
			vll = vl * sigma;
			vuu = vu * sigma;
		}
	}

	// Partition real workspace RWORK:
	// INDD: diagonal (length N), INDE: off-diagonal (length N), INDRWK: scratch
	indd = offsetRWORK;
	inde = indd + N;
	indrwk = inde + N;

	// Partition complex workspace WORK:

	// INDTAU: TAU (length N), INDWRK: scratch
	indtau = offsetWORK;
	indwrk = offsetWORK + ( N * strideWORK );
	llwork = lwork - N;

	// Reduce to tridiagonal form
	zhetrd( uplo, N, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, indd, RWORK, strideRWORK, inde, WORK, strideWORK, indtau );

	// Determine if we can use the fast path

	// Fast path: computing all eigenvalues with abstol <= 0
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	if ( ( alleig || test ) && abstol <= 0.0 ) {
		dcopy( N, RWORK, strideRWORK, indd, w, strideW, offsetW );
		indee = indrwk + ( 2 * N );

		if ( !wantz ) {
			dcopy( N - 1, RWORK, strideRWORK, inde, RWORK, strideRWORK, indee );
			info = dsterf( N, w, strideW, offsetW, RWORK, strideRWORK, indee );
		} else {
			zlacpy( 'all', N, N, A, strideA1, strideA2, offsetA, Z, strideZ1, strideZ2, offsetZ );
			zungtr( uplo, N, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indtau, WORK, strideWORK, indwrk );
			dcopy( N - 1, RWORK, strideRWORK, inde, RWORK, strideRWORK, indee );
			info = zsteqr( 'update', N, w, strideW, offsetW, RWORK, strideRWORK, indee, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWORK, indrwk );
			if ( info === 0 ) {
				for ( i = 0; i < N; i++ ) {
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = 0;
				}
			}
		}

		if ( info === 0 ) {
			M = N;
		} else {
			// If zsteqr/dsterf failed, fall through to dstebz path
			info = 0;
			M = 0; // Will be set by dstebz
		}
	}

	// If we haven't found eigenvalues yet (selective or fast path failed), use dstebz
	if ( M === 0 && info === 0 ) {
		if ( wantz ) {
			order = 'block';
		} else {
			order = 'entire';
		}

		// Integer workspace for dstebz
		indibl = offsetIWORK;
		indisp = indibl + N;
		indiwk = indisp + N;

		// Allocate M and nsplit as arrays for dstebz output
		Mout = new Int32Array( 1 );
		nsplit = new Int32Array( 1 );

		info = dstebz( range, order, N, vll, vuu, il, iu, abstll,
			RWORK, strideRWORK, indd,
			RWORK, strideRWORK, inde,
			Mout, nsplit,
			w, strideW, offsetW,
			IWORK, strideIWORK, indibl,
			IWORK, strideIWORK, indisp,
			RWORK, strideRWORK, indrwk,
			IWORK, strideIWORK, indiwk
		);

		M = Mout[ 0 ];

		if ( wantz && M > 0 ) {
			info = zstein( N, RWORK, strideRWORK, indd, RWORK, strideRWORK, inde,
				M, w, strideW, offsetW,
				IWORK, strideIWORK, indibl,
				IWORK, strideIWORK, indisp,
				Z, strideZ1, strideZ2, offsetZ,
				RWORK, strideRWORK, indrwk,
				IWORK, strideIWORK, indiwk,
				IFAIL, strideIFAIL, offsetIFAIL
			);

			// Transform eigenvectors back to original space
			zunmtr( 'left', uplo, 'no-transpose', N, M,
				A, strideA1, strideA2, offsetA,
				WORK, strideWORK, indtau,
				Z, strideZ1, strideZ2, offsetZ,
				WORK, strideWORK, indwrk,
				llwork
			);
		}
	}

	// If matrix was scaled, rescale eigenvalues
	if ( iscale === 1 ) {
		if ( info === 0 ) {
			imax = M;
		} else {
			imax = info - 1;
		}
		dscal( imax, 1.0 / sigma, w, strideW, offsetW );
	}

	// Sort eigenvalues and eigenvectors by eigenvalue (ascending)
	if ( wantz ) {
		for ( j = 0; j < M - 1; j++ ) {
			i = -1;
			tmp1 = w[ offsetW + ( j * strideW ) ];
			for ( jj = j + 1; jj < M; jj++ ) {
				if ( w[ offsetW + ( jj * strideW ) ] < tmp1 ) {
					i = jj;
					tmp1 = w[ offsetW + ( jj * strideW ) ];
				}
			}

			if ( i >= 0 ) {
				itmp1 = IWORK[ indibl + i ];
				w[ offsetW + ( i * strideW ) ] = w[ offsetW + ( j * strideW ) ];
				IWORK[ indibl + i ] = IWORK[ indibl + j ];
				w[ offsetW + ( j * strideW ) ] = tmp1;
				IWORK[ indibl + j ] = itmp1;
				zswap( N, Z, strideZ1, offsetZ + ( i * strideZ2 ), Z, strideZ1, offsetZ + ( j * strideZ2 ) );
				if ( info !== 0 ) {
					itmp1 = IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ];
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = IFAIL[ offsetIFAIL + ( j * strideIFAIL ) ];
					IFAIL[ offsetIFAIL + ( j * strideIFAIL ) ] = itmp1;
				}
			}
		}
	}

	out.M = M;
	return info;
}


// EXPORTS //

export default zheevx;
