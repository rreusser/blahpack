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

/* eslint-disable max-len, max-params, no-var, max-lines, max-statements */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlansp from '../../dlansp/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dsptrd from '../../dsptrd/lib/base.js';
import dopgtr from '../../dopgtr/lib/base.js';
import dopmtr from '../../dopmtr/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import dstein from '../../dstein/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var sqrt = Math.sqrt;
var min = Math.min;


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real.
* symmetric matrix in packed storage.
*
* Eigenvalues and eigenvectors can be selected by specifying a range of values
* (RANGE='value') or a range of indices (RANGE='index') for the desired
* eigenvalues.
*
* Algorithm: scale matrix if needed, reduce to tridiagonal form via dsptrd,
* compute eigenvalues via dsterf (no vectors) or dopgtr+dsteqr (with vectors)
* for all eigenvalues with abstol<=0, or use dstebz+dstein+dopmtr for
* selective eigenvalues, then sort and undo scaling.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix; on exit, overwritten by dsptrd
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Z - output eigenvector matrix (N x M)
* @param {integer} strideZ1 - stride of first dimension of `Z`
* @param {integer} strideZ2 - stride of second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace (length >= 8*N)
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWORK - stride for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for `IFAIL`
* @param {NonNegativeInteger} offsetIFAIL - starting index for `IFAIL`
* @returns {integer} info - 0 if successful, >0 if eigenvectors failed to converge
*/
function dspevx( jobz, range, uplo, N, AP, strideAP, offsetAP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) {
	var alleig;
	var valeig;
	var indeig;
	var safmin;
	var smlnum;
	var bignum;
	var iscale;
	var abstll;
	var nsplit;
	var indtau;
	var indwrk;
	var indibl;
	var indisp;
	var indiwo;
	var wantz;
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

	info = 0;
	M = 0;

	// Quick return if possible
	if ( N === 0 ) {
		out.M = 0;
		return 0;
	}

	if ( N === 1 ) {
		if ( alleig || indeig ) {
			M = 1;
			w[ offsetW ] = AP[ offsetAP ];
		} else if ( valeig ) {
			if ( vl < AP[ offsetAP ] && vu >= AP[ offsetAP ] ) {
				M = 1;
				w[ offsetW ] = AP[ offsetAP ];
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

	anrm = dlansp( 'max', uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK );
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
		if ( abstol > 0.0 ) {
			abstll = abstol * sigma;
		}
		if ( valeig ) {
			vll = vl * sigma;
			vuu = vu * sigma;
		}
	}

	// Partition workspace WORK:
	// Fortran 1-based: INDTAU=1, INDE=INDTAU+N, INDD=INDE+N, INDWRK=INDD+N
	// JS 0-based offsets into WORK:
	indtau = offsetWORK;
	inde = indtau + N;
	indd = inde + N;
	indwrk = indd + N;

	// Reduce to tridiagonal form via dsptrd

	// dsptrd( uplo, N, AP, strideAP, offsetAP, D, strideD, offsetD, E, strideE, offsetE, TAU, strideTAU, offsetTAU )
	dsptrd( uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, indd, WORK, strideWORK, inde, WORK, strideWORK, indtau );

	// Determine if we can use the fast path
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	if ( ( alleig || test ) && abstol <= 0.0 ) {
		dcopy( N, WORK, strideWORK, indd, w, strideW, offsetW );
		indee = indwrk + ( 2 * N );

		if ( wantz ) {
			dopgtr( uplo, N, AP, strideAP, offsetAP, WORK, strideWORK, indtau, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk );
			dcopy( N - 1, WORK, strideWORK, inde, WORK, strideWORK, indee );
			info = dsteqr( 'update', N, w, strideW, offsetW, WORK, strideWORK, indee, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk );
			if ( info === 0 ) {
				for ( i = 0; i < N; i++ ) {
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = 0;
				}
			}
		} else {
			dcopy( N - 1, WORK, strideWORK, inde, WORK, strideWORK, indee );
			info = dsterf( N, w, strideW, offsetW, WORK, strideWORK, indee );
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
		indibl = offsetIWORK;
		indisp = indibl + N;
		indiwo = indisp + N;

		// Allocate M and nsplit as arrays for dstebz output
		Mout = new Int32Array( 1 );
		nsplit = new Int32Array( 1 );

		info = dstebz( range, order, N, vll, vuu, il, iu, abstll, WORK, strideWORK, indd, WORK, strideWORK, inde, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWORK, indibl, IWORK, strideIWORK, indisp, WORK, strideWORK, indwrk, IWORK, strideIWORK, indiwo );

		M = Mout[ 0 ];

		if ( wantz && M > 0 ) {
			info = dstein( N, WORK, strideWORK, indd, WORK, strideWORK, inde, M, w, strideW, offsetW, IWORK, strideIWORK, indibl, IWORK, strideIWORK, indisp, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk, IWORK, strideIWORK, indiwo, IFAIL, strideIFAIL, offsetIFAIL );

			// Transform eigenvectors back to original space via dopmtr
			dopmtr( 'left', uplo, 'no-transpose', N, M, AP, strideAP, offsetAP, WORK, strideWORK, indtau, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk );
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

export default dspevx;
