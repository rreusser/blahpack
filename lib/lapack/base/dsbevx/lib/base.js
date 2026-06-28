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

/* eslint-disable max-len, max-params, no-var, max-lines */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlansb from '../../dlansb/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dsbtrd from '../../dsbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import dstein from '../../dstein/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var sqrt = Math.sqrt;
var min = Math.min;


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real symmetric band matrix A.
*
* ## Algorithm
*
* The routine first reduces the band matrix to tridiagonal form via `dsbtrd`.
* If all eigenvalues are requested with `abstol <= 0`, it uses `dsterf` (no
* vectors) or `dsteqr` (with vectors). Otherwise it uses `dstebz` for
* selective eigenvalue computation and `dstein` + `dgemv` back-transform for
* eigenvectors. Eigenvalues are rescaled if the matrix norm was adjusted, and
* eigenpairs are sorted in ascending eigenvalue order.
*
* `M` is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: `out.M`.
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Float64Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB`
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} Q - output orthogonal matrix from dsbtrd (N-by-N)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} Z - output eigenvector matrix (N-by-M)
* @param {integer} strideZ1 - stride of first dimension of Z
* @param {integer} strideZ2 - stride of second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace (length >= 7*N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @returns {integer} info - 0 if successful, >0 if eigenvectors failed to converge
*/
function dsbevx( jobz, range, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) {
	var alleig;
	var valeig;
	var indeig;
	var safmin;
	var smlnum;
	var bignum;
	var iscale;
	var abstll;
	var nsplit;
	var indibl;
	var indisp;
	var indiwo;
	var indwrk;
	var wantz;
	var lower;
	var sigma;
	var indee;
	var order;
	var itmp1;
	var anrm;
	var rmin;
	var rmax;
	var info;
	var imax;
	var inde;
	var indd;
	var Mout;
	var tmp1;
	var test;
	var eps;
	var vll;
	var vuu;
	var jj;
	var i;
	var j;
	var M;

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
		if ( lower ) {
			tmp1 = AB[ offsetAB ];
		} else {
			tmp1 = AB[ offsetAB + ( kd * strideAB1 ) ];
		}
		if ( alleig || indeig ) {
			M = 1;
			w[ offsetW ] = tmp1;
		} else if ( valeig ) {
			if ( vl < tmp1 && vu >= tmp1 ) {
				M = 1;
				w[ offsetW ] = tmp1;
			}
		}
		if ( wantz && M === 1 ) {
			Z[ offsetZ ] = 1.0;
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
	if ( valeig ) {
		vll = vl;
		vuu = vu;
	} else {
		vll = 0.0;
		vuu = 0.0;
	}

	anrm = dlansb( 'max', uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, offsetWork );
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
		if ( abstol > 0.0 ) {
			abstll = abstol * sigma;
		}
		if ( valeig ) {
			vll = vl * sigma;
			vuu = vu * sigma;
		}
	}

	// Partition workspace WORK:
	// Fortran: INDD=1, INDE=INDD+N, INDWRK=INDE+N (1-based)
	// JS (0-based): indd=offsetWork, inde=offsetWork+N, indwrk=offsetWork+2*N
	indd = offsetWork;
	inde = indd + ( N * strideWork );
	indwrk = inde + ( N * strideWork );

	// Reduce to tridiagonal form via dsbtrd
	dsbtrd( ( ( wantz ) ? 'initialize' : 'none' ), uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, strideWork, indd, WORK, strideWork, inde, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, indwrk );

	// Determine if we can use the fast path
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	if ( ( alleig || test ) && abstol <= 0.0 ) {
		dcopy( N, WORK, strideWork, indd, w, strideW, offsetW );
		indee = indwrk + ( 2 * N * strideWork );

		if ( wantz ) {
			dlacpy( 'all', N, N, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ );
			dcopy( N - 1, WORK, strideWork, inde, WORK, strideWork, indee );
			info = dsteqr( 'update', N, w, strideW, offsetW, WORK, strideWork, indee, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indwrk );
			if ( info === 0 ) {
				for ( i = 0; i < N; i++ ) {
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = 0;
				}
			}
		} else {
			dcopy( N - 1, WORK, strideWork, inde, WORK, strideWork, indee );
			info = dsterf( N, w, strideW, offsetW, WORK, strideWork, indee );
		}

		if ( info === 0 ) {
			M = N;
		} else {
			// If dsteqr/dsterf failed, fall through to dstebz path
			info = 0;
			M = 0;
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
		indibl = offsetIWork;
		indisp = indibl + ( N * strideIWork );
		indiwo = indisp + ( N * strideIWork );

		// Allocate M and nsplit as arrays for dstebz output
		Mout = new Int32Array( 1 );
		nsplit = new Int32Array( 1 );

		dstebz( range, order, N, vll, vuu, il, iu, abstll, WORK, strideWork, indd, WORK, strideWork, inde, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWork, indibl, IWORK, strideIWork, indisp, WORK, strideWork, indwrk, IWORK, strideIWork, indiwo );

		M = Mout[ 0 ];

		if ( wantz && M > 0 ) {
			info = dstein( N, WORK, strideWork, indd, WORK, strideWork, inde, M, w, strideW, offsetW, IWORK, strideIWork, indibl, IWORK, strideIWork, indisp, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, indwrk, IWORK, strideIWork, indiwo, IFAIL, strideIFAIL, offsetIFAIL );

			// Transform eigenvectors back to original space via Z = Q * Z
			for ( j = 0; j < M; j++ ) {
				dcopy( N, Z, strideZ1, offsetZ + ( j * strideZ2 ), WORK, strideWork, offsetWork );
				dgemv( 'no-transpose', N, N, 1.0, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, 0.0, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
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
				itmp1 = IWORK[ indibl + ( i * strideIWork ) ];
				w[ offsetW + ( i * strideW ) ] = w[ offsetW + ( j * strideW ) ];
				IWORK[ indibl + ( i * strideIWork ) ] = IWORK[ indibl + ( j * strideIWork ) ];
				w[ offsetW + ( j * strideW ) ] = tmp1;
				IWORK[ indibl + ( j * strideIWork ) ] = itmp1;
				dswap( N, Z, strideZ1, offsetZ + ( i * strideZ2 ), Z, strideZ1, offsetZ + ( j * strideZ2 ) );
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

export default dsbevx;
