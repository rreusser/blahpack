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

/* eslint-disable max-len, max-params, max-lines */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import dstein from '../../dstein/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var sqrt = Math.sqrt;
var min = Math.min;


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real.
* symmetric tridiagonal matrix T.
*
* Eigenvalues and eigenvectors can be selected by specifying either a range
* of values or a range of indices for the desired eigenvalues.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. For eigenvalues-only (all eigenvalues): use dsterf
* 3. Otherwise: use dstebz for eigenvalue bisection + dstein for eigenvectors
* 4. Sort eigenvalues and eigenvectors, undo scaling
*
* Note: This implementation does not use DSTEMR (the MRRR algorithm).
* It always uses the DSTEBZ+DSTEIN fallback path. For eigenvalues-only
* with all eigenvalues requested, DSTERF is used instead.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal elements (length N), destroyed on exit
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements (length N-1), destroyed on exit
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} Z - output eigenvector matrix (N x M)
* @param {integer} strideZ1 - stride of first dimension of Z
* @param {integer} strideZ2 - stride of second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Int32Array} ISUPPZ - support of eigenvectors (length 2*M)
* @param {integer} strideISUPPZ - stride for ISUPPZ
* @param {NonNegativeInteger} offsetISUPPZ - starting index for ISUPPZ
* @param {Float64Array} WORK - workspace (length >= 20*N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK
* @param {Int32Array} IWORK - integer workspace (length >= 10*N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {integer} liwork - length of IWORK
* @returns {integer} info - 0 if successful, >0 if internal error
*/
function dstevr( jobz, range, N, d, strideD, offsetD, e, strideE, offsetE, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, ISUPPZ, strideISUPPZ, offsetISUPPZ, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork, liwork ) { // eslint-disable-line max-len, max-params
	var alleig;
	var valeig;
	var indeig;
	var safmin;
	var smlnum;
	var bignum;
	var iscale;
	var indibl;
	var indisp;
	var indifl;
	var indiwo;
	var nsplit;
	var wantz;
	var sigma;
	var order;
	var itmp1;
	var tnrm;
	var rmin;
	var rmax;
	var info;
	var imax;
	var Mout;
	var tmp1;
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

	// N = 1 special case
	if ( N === 1 ) {
		if ( alleig || indeig ) {
			M = 1;
			w[ offsetW ] = d[ offsetD ];
		} else if ( valeig ) {
			if ( vl < d[ offsetD ] && vu >= d[ offsetD ] ) {
				M = 1;
				w[ offsetW ] = d[ offsetD ];
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
	vll = vl;
	vuu = vu;

	tnrm = dlanst( 'max', N, d, strideD, offsetD, e, strideE, offsetE );
	if ( tnrm > 0.0 && tnrm < rmin ) {
		iscale = 1;
		sigma = rmin / tnrm;
	} else if ( tnrm > rmax ) {
		iscale = 1;
		sigma = rmax / tnrm;
	}
	if ( iscale === 1 ) {
		dscal( N, sigma, d, strideD, offsetD );
		dscal( N - 1, sigma, e, strideE, offsetE );
		if ( valeig ) {
			vll = vl * sigma;
			vuu = vu * sigma;
		}
	}

	// Partition IWORK:
	indibl = offsetIWork;
	indisp = indibl + N;
	indifl = indisp + N;
	indiwo = indisp + N; // Fortran: INDIWO = INDISP + N (overlaps INDIFL)

	// Fast path: all eigenvalues, eigenvalues-only => use dsterf
	if ( alleig && !wantz ) {
		dcopy( N, d, strideD, offsetD, w, strideW, offsetW );
		dcopy( N - 1, e, strideE, offsetE, WORK, 1, offsetWork );
		info = dsterf( N, w, strideW, offsetW, WORK, 1, offsetWork );

		if ( info === 0 ) {
			M = N;
			out.M = M;

			// Undo scaling
			if ( iscale === 1 ) {
				dscal( M, 1.0 / sigma, w, strideW, offsetW );
			}
			return 0;
		}
		// If dsterf failed, fall through to dstebz path
		info = 0;
	}

	// Use dstebz for eigenvalue bisection
	if ( wantz ) {
		order = 'block';
	} else {
		order = 'entire';
	}

	Mout = new Int32Array( 1 );
	nsplit = new Int32Array( 1 );

	info = dstebz( range, order, N, vll, vuu, il, iu, abstol, d, strideD, offsetD, e, strideE, offsetE, Mout, nsplit, w, strideW, offsetW, IWORK, 1, indibl, IWORK, 1, indisp, WORK, 1, offsetWork, IWORK, 1, indiwo);

	M = Mout[ 0 ];

	if ( wantz && M > 0 ) {
		info = dstein( N, d, strideD, offsetD, e, strideE, offsetE, M, w, strideW, offsetW, IWORK, 1, indibl, IWORK, 1, indisp, Z, strideZ1, strideZ2, offsetZ, WORK, 1, offsetWork, IWORK, 1, indiwo, IWORK, 1, indifl);
	}

	// Undo scaling if necessary
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
			}
		}
	}

	out.M = M;
	return info;
}


// EXPORTS //

export default dstevr;
