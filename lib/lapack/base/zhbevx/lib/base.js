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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlanhb from '../../zlanhb/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zhbtrd from '../../zhbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import zsteqr from '../../zsteqr/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import zstein from '../../zstein/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var sqrt = Math.sqrt;
var min = Math.min;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A.
*
* ## Algorithm
*
* The routine first reduces the band matrix to tridiagonal form via `zhbtrd`.
* If all eigenvalues are requested with `abstol <= 0`, it uses `dsterf` (no
* vectors) or `zsteqr` (with vectors). Otherwise it uses `dstebz` for
* selective eigenvalue computation and `zstein` + `zgemv` back-transform for
* eigenvectors. Eigenvalues are rescaled if the matrix norm was adjusted, and
* eigenpairs are sorted in ascending eigenvalue order.
*
* `M` is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: `out.M`.
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Complex128Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Complex128Array} Q - output unitary matrix from zhbtrd (N-by-N)
* @param {integer} strideQ1 - stride of the first dimension of Q (in complex elements)
* @param {integer} strideQ2 - stride of the second dimension of Q (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (in complex elements)
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output eigenvector matrix (N-by-M)
* @param {integer} strideZ1 - stride of first dimension of Z (in complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (in complex elements)
* @param {Complex128Array} WORK - complex workspace (length >= N)
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 7*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @returns {integer} info - 0 if successful, >0 if eigenvectors failed to converge
*/
function zhbevx( jobz, range, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len
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
	var indrwk;
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
	var ABv;
	var eps;
	var vll;
	var vuu;
	var Zv;
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
		ABv = reinterpret( AB, 0 );
		if ( lower ) {
			tmp1 = ABv[ offsetAB * 2 ]; // real part of AB(1,1)
		} else {
			tmp1 = ABv[ ( offsetAB + ( kd * strideAB1 ) ) * 2 ]; // real part of AB(kd+1,1)
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
			Zv = reinterpret( Z, 0 );
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
	if ( valeig ) {
		vll = vl;
		vuu = vu;
	} else {
		vll = 0.0;
		vuu = 0.0;
	}

	anrm = zlanhb( 'max', uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, offsetRWork );
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
		if ( abstol > 0.0 ) {
			abstll = abstol * sigma;
		}
		if ( valeig ) {
			vll = vl * sigma;
			vuu = vu * sigma;
		}
	}

	// Partition real workspace RWORK:
	// Fortran: INDD=1, INDE=INDD+N, INDRWK=INDE+N (1-based)
	// JS (0-based): indd=offsetRWork, inde=offsetRWork+N, indrwk=offsetRWork+2*N
	indd = offsetRWork;
	inde = indd + ( N * strideRWork );
	indrwk = inde + ( N * strideRWork );

	// Reduce to tridiagonal form via zhbtrd; D goes into RWORK[indd..], E goes into RWORK[inde..]
	zhbtrd( ( ( wantz ) ? 'initialize' : 'none' ), uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, indd, RWORK, strideRWork, inde, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork );

	// Determine if we can use the fast path
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	if ( ( alleig || test ) && abstol <= 0.0 ) {
		dcopy( N, RWORK, strideRWork, indd, w, strideW, offsetW );
		indee = indrwk + ( 2 * N * strideRWork );

		if ( wantz ) {
			zlacpy( 'all', N, N, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ );
			dcopy( N - 1, RWORK, strideRWork, inde, RWORK, strideRWork, indee );
			info = zsteqr( 'update', N, w, strideW, offsetW, RWORK, strideRWork, indee, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWork, indrwk );
			if ( info === 0 ) {
				for ( i = 0; i < N; i++ ) {
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = 0;
				}
			}
		} else {
			dcopy( N - 1, RWORK, strideRWork, inde, RWORK, strideRWork, indee );
			info = dsterf( N, w, strideW, offsetW, RWORK, strideRWork, indee );
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

		dstebz( range, order, N, vll, vuu, il, iu, abstll, RWORK, strideRWork, indd, RWORK, strideRWork, inde, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWork, indibl, IWORK, strideIWork, indisp, RWORK, strideRWork, indrwk, IWORK, strideIWork, indiwo );

		M = Mout[ 0 ];

		if ( wantz && M > 0 ) {
			info = zstein( N, RWORK, strideRWork, indd, RWORK, strideRWork, inde, M, w, strideW, offsetW, IWORK, strideIWork, indibl, IWORK, strideIWork, indisp, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWork, indrwk, IWORK, strideIWork, indiwo, IFAIL, strideIFAIL, offsetIFAIL );

			// Transform eigenvectors back to original space: Z(:,j) = Q * Z(:,j)
			for ( j = 0; j < M; j++ ) {
				zcopy( N, Z, strideZ1, offsetZ + ( j * strideZ2 ), WORK, strideWork, offsetWork );
				zgemv( 'no-transpose', N, N, CONE, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, CZERO, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
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

export default zhbevx;
