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

/* eslint-disable max-len, max-params, max-lines */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlanhe from '../../zlanhe/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zhetrd from '../../zhetrd/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import zstein from '../../zstein/lib/base.js';
import zunmtr from '../../zunmtr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var sqrt = Math.sqrt;
var min = Math.min;
var max = Math.max;


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex.
* Hermitian matrix A.
*
* Eigenvalues and eigenvectors can be selected by specifying either a range
* of values or a range of indices for the desired eigenvalues.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via zhetrd
* 3. For eigenvalues-only (all eigenvalues): use dsterf
* 4. Otherwise: use dstebz for eigenvalue bisection + zstein for eigenvectors
* 5. Transform eigenvectors back via zunmtr
* 6. Sort eigenvalues and eigenvectors, undo scaling
*
* Note: This implementation does not use ZSTEMR (the MRRR algorithm).
* It always uses the DSTEBZ+ZSTEIN fallback path. For eigenvalues-only
* with all eigenvalues requested, DSTERF is used instead.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix (destroyed on exit)
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
* @param {Complex128Array} Z - output eigenvector matrix (N x M)
* @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @param {Int32Array} ISUPPZ - support of eigenvectors (length 2*M)
* @param {integer} strideISUPPZ - stride for ISUPPZ
* @param {NonNegativeInteger} offsetISUPPZ - starting index for ISUPPZ
* @param {Complex128Array} WORK - complex workspace (length >= 2*N)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - length of WORK (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 24*N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @param {integer} lrwork - length of RWORK
* @param {Int32Array} IWORK - integer workspace (length >= 10*N)
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {integer} liwork - length of IWORK
* @returns {integer} info - 0 if successful, >0 if internal error
*/
function zheevr( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, ISUPPZ, strideISUPPZ, offsetISUPPZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, lrwork, IWORK, strideIWORK, offsetIWORK, liwork ) { // eslint-disable-line max-len, max-params
	var alleig;
	var valeig;
	var indeig;
	var safmin;
	var smlnum;
	var bignum;
	var iscale;
	var abstll;
	var indree;
	var indrwk;
	var indibl;
	var indisp;
	var indifl;
	var indiwo;
	var nsplit;
	var wantz;
	var lower;
	var sigma;
	var indrd;
	var indre;
	var order;
	var itmp1;
	var anrm;
	var rmin;
	var rmax;
	var info;
	var imax;
	var Mout;
	var tmp1;
	var eps;
	var vll;
	var vuu;
	var TAU;
	var Av;
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

	// N = 1 special case
	if ( N === 1 ) {
		Av = reinterpret( A, 0 );
		if ( alleig || indeig ) {
			M = 1;
			w[ offsetW ] = Av[ offsetA * 2 ]; // real part of A(1,1)
		} else if ( valeig ) {
			if ( vl < Av[ offsetA * 2 ] && vu >= Av[ offsetA * 2 ] ) {
				M = 1;
				w[ offsetW ] = Av[ offsetA * 2 ];
			}
		}
		if ( wantz && M === 1 ) {
			Zv = reinterpret( Z, 0 );
			Zv[ offsetZ * 2 ] = 1.0;
			Zv[ offsetZ * 2 + 1 ] = 0.0;
			ISUPPZ[ offsetISUPPZ ] = 1;
			ISUPPZ[ offsetISUPPZ + strideISUPPZ ] = 1;
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
	vll = vl;
	vuu = vu;

	// Zlanhe computes the norm using Complex128Array with complex-element strides
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
				// Scale column j from diagonal downward: elements j..N-1 in column j
				zdscal( N - j, sigma, A, strideA1, offsetA + ( j * strideA1 ) + ( j * strideA2 ) );
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				// Scale column j from top to diagonal: elements 0..j in column j
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

	// Allocate TAU separately to avoid aliasing with WORK
	TAU = new Complex128Array( max( 1, N - 1 ) );

	// Partition RWORK:

	// indrd: diagonal (N), indre: off-diagonal (N), indree: copy of off-diagonal (N),

	// indrwk: remaining workspace
	indrd = offsetRWORK;
	indre = indrd + N;
	indree = indre + N;
	indrwk = indree + N;

	// Partition IWORK:

	// indibl: block indices (N), indisp: split indices (N),

	// indifl: fail indices (N), indiwo: remaining workspace
	indibl = offsetIWORK;
	indisp = indibl + N;
	indifl = indisp + N;
	indiwo = indifl + N;

	// Reduce Hermitian matrix to tridiagonal form
	zhetrd( uplo, N, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, indrd, RWORK, strideRWORK, indre, TAU, 1, 0 );

	// Fast path: all eigenvalues, eigenvalues-only => use dsterf
	if ( alleig && !wantz ) {
		dcopy( N, RWORK, strideRWORK, indrd, w, strideW, offsetW );
		dcopy( N - 1, RWORK, strideRWORK, indre, RWORK, strideRWORK, indree );
		info = dsterf( N, w, strideW, offsetW, RWORK, strideRWORK, indree );

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

	info = dstebz( range, order, N, vll, vuu, il, iu, abstll, RWORK, strideRWORK, indrd, RWORK, strideRWORK, indre, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWORK, indibl, IWORK, strideIWORK, indisp, RWORK, strideRWORK, indrwk, IWORK, strideIWORK, indiwo);

	M = Mout[ 0 ];

	if ( wantz && M > 0 ) {
		info = zstein( N, RWORK, strideRWORK, indrd, RWORK, strideRWORK, indre, M, w, strideW, offsetW, IWORK, strideIWORK, indibl, IWORK, strideIWORK, indisp, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWORK, indrwk, IWORK, strideIWORK, indiwo, IWORK, strideIWORK, indifl);

		// Transform eigenvectors back to original space
		zunmtr( 'left', uplo, 'no-transpose', N, M, A, strideA1, strideA2, offsetA, TAU, 1, 0, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork);
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
				zswap( N, Z, strideZ1, offsetZ + ( i * strideZ2 ), Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
		}
	}

	out.M = M;
	return info;
}


// EXPORTS //

export default zheevr;
