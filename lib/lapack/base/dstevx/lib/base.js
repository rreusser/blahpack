/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import dstein from '../../dstein/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var SAFMIN = dlamch( 'Safe minimum' );
var EPS = dlamch( 'Precision' );
var SMLNUM = SAFMIN / EPS;
var BIGNUM = ONE / SMLNUM;
var RMIN = Math.sqrt( SMLNUM );
var RMAX = Math.min( Math.sqrt( BIGNUM ), ONE / Math.sqrt( Math.sqrt( SAFMIN ) ) );


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real.
* symmetric tridiagonal matrix A.
*
* Eigenvalues and eigenvectors can be selected by specifying either a
* range of values or a range of indices for the desired eigenvalues.
*
* @private
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal elements (length N), may be modified
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} e - subdiagonal elements (length N-1), may be modified
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - offset for e
* @param {number} vl - lower bound of value interval (range='value')
* @param {number} vu - upper bound of value interval (range='value')
* @param {integer} il - 1-based index of smallest eigenvalue (range='index')
* @param {integer} iu - 1-based index of largest eigenvalue (range='index')
* @param {number} abstol - absolute error tolerance for eigenvalues
* @param {Int32Array} M - output: number of eigenvalues found (M[0])
* @param {Float64Array} w - output: selected eigenvalues in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - offset for w
* @param {Float64Array} Z - output: eigenvectors (if jobz='compute-vectors')
* @param {integer} strideZ1 - stride of first dimension of Z
* @param {integer} strideZ2 - stride of second dimension of Z
* @param {NonNegativeInteger} offsetZ - offset for Z
* @param {Float64Array} WORK - caller-owned workspace of length 5*N; base.js never allocates. Shared scratch for the internal DSTEBZ (leading 4*N) and then DSTEIN (5*N), matching the reference DSTEVX INDWRK=1 partition.
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {Int32Array} IWORK - caller-owned integer workspace of length 5*N; base.js never allocates. Partitioned as IBLOCK (IWORK[0:N]), ISPLIT (IWORK[N:2*N], INDISP), and the INDIWO scratch (IWORK[2*N:5*N]) reused as DSTEBZ's IWORK (3*N) then DSTEIN's IWORK (N).
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - offset for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - offset for IFAIL
* @returns {integer} info - 0 on success, >0 if eigenvectors failed to converge
*/
function dstevx( jobz, range, N, d, strideD, offsetD, e, strideE, offsetE, vl, vu, il, iu, abstol, M, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	var nsplit;
	var alleig;
	var valeig;
	var indeig;
	var iscale;
	var wantz;
	var sigma;
	var order;
	var itmp1;
	var tnrm;
	var test;
	var imax;
	var info;
	var Mout;
	var tmp1;
	var vll;
	var vuu;
	var jj;
	var m;
	var i;
	var j;

	// Decode job parameters
	wantz = ( jobz === 'compute-vectors' );
	alleig = ( range === 'all' );
	valeig = ( range === 'value' );
	indeig = ( range === 'index' );

	// Quick return if possible
	M[ 0 ] = 0;
	if ( N === 0 ) {
		return 0;
	}

	// N=1 special case
	if ( N === 1 ) {
		if ( alleig || indeig ) {
			M[ 0 ] = 1;
			w[ offsetW ] = d[ offsetD ];
		} else {
			// valeig
			if ( vl < d[ offsetD ] && vu >= d[ offsetD ] ) {
				M[ 0 ] = 1;
				w[ offsetW ] = d[ offsetD ];
			}
		}
		if ( wantz && M[ 0 ] === 1 ) {
			Z[ offsetZ ] = ONE;
		}
		return 0;
	}

	// Scale matrix to allowable range, if necessary
	iscale = 0;
	if ( valeig ) {
		vll = vl;
		vuu = vu;
	} else {
		vll = ZERO;
		vuu = ZERO;
	}

	tnrm = dlanst( 'max', N, d, strideD, offsetD, e, strideE, offsetE );
	if ( tnrm > ZERO && tnrm < RMIN ) {
		iscale = 1;
		sigma = RMIN / tnrm;
	} else if ( tnrm > RMAX ) {
		iscale = 1;
		sigma = RMAX / tnrm;
	}
	if ( iscale === 1 ) {
		dscal( N, sigma, d, strideD, offsetD );
		dscal( N - 1, sigma, e, strideE, offsetE );
		if ( valeig ) {
			vll = vl * sigma;
			vuu = vu * sigma;
		}
	}

	// If all eigenvalues are desired and ABSTOL is less than or equal to zero,
	// Then call DSTERF or DSTEQR. If this fails for some eigenvalue, then
	// Try DSTEBZ.
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	info = 0;
	if ( ( alleig || test ) && abstol <= ZERO ) {
		dcopy( N, d, strideD, offsetD, w, strideW, offsetW );

		// Copy E into WORK
		dcopy( N - 1, e, strideE, offsetE, WORK, strideWork, offsetWork );

		if ( !wantz ) {
			info = dsterf( N, w, strideW, offsetW, WORK, strideWork, offsetWork );
		} else {
			info = dsteqr( 'initialize', N, w, strideW, offsetW, WORK, strideWork, offsetWork, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork + ( N * strideWork ) );
			if ( info === 0 ) {
				for ( i = 0; i < N; i++ ) {
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = 0;
				}
			}
		}
		if ( info === 0 ) {
			M[ 0 ] = N;

			// Rescale if needed and return
			if ( iscale === 1 ) {
				dscal( N, ONE / sigma, w, strideW, offsetW );
			}
			return 0;
		}
		info = 0;
	}

	// Otherwise, call DSTEBZ and, if eigenvectors are desired, DSTEIN.
	if ( wantz ) {
		order = 'block';
	} else {
		order = 'entire';
	}

	// Partition the caller-owned WORK(5*N)/IWORK(5*N) to match the reference
	// DSTEVX. WORK[0:5*N] is shared scratch: DSTEBZ uses the leading 4*N, then
	// DSTEIN reuses the same region for its 5*N workspace (INDWRK=1 in the
	// reference). IWORK is split into IBLOCK (IWORK[0:N]), ISPLIT
	// (IWORK[N:2*N], INDISP=1+N), and the INDIWO scratch region
	// (IWORK[2*N:5*N], INDIWO=1+2*N) used as DSTEBZ's IWORK (3*N) and then
	// DSTEIN's IWORK (N). Eigenvalues are written directly into w and the
	// non-converged indices directly into IFAIL, exactly as the reference
	// passes W and IFAIL. base.js never allocates problem-sized workspace.
	Mout = new Int32Array( 1 );
	nsplit = new Int32Array( 1 );

	info = dstebz( range, order, N, vll, vuu, il, iu, abstol, d, strideD, offsetD, e, strideE, offsetE, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWork, offsetIWork, IWORK, strideIWork, offsetIWork + ( N * strideIWork ), WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork + ( 2 * N * strideIWork ) );

	m = Mout[ 0 ];
	M[ 0 ] = m;

	if ( wantz ) {
		info = dstein( N, d, strideD, offsetD, e, strideE, offsetE, m, w, strideW, offsetW, IWORK, strideIWork, offsetIWork, IWORK, strideIWork, offsetIWork + ( N * strideIWork ), Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork + ( 2 * N * strideIWork ), IFAIL, strideIFAIL, offsetIFAIL );
	}

	// If matrix was scaled, then rescale eigenvalues appropriately
	if ( iscale === 1 ) {
		if ( info === 0 ) {
			imax = m;
		} else {
			imax = info - 1;
		}
		dscal( imax, ONE / sigma, w, strideW, offsetW );
	}

	// If eigenvalues are not in order, then sort them, along with eigenvectors
	if ( wantz ) {
		for ( j = 0; j < m - 1; j++ ) {
			i = -1;
			tmp1 = w[ offsetW + ( j * strideW ) ];
			for ( jj = j + 1; jj < m; jj++ ) {
				if ( w[ offsetW + ( jj * strideW ) ] < tmp1 ) {
					i = jj;
					tmp1 = w[ offsetW + ( jj * strideW ) ];
				}
			}

			if ( i !== -1 ) {
				// Swap eigenvalues
				w[ offsetW + ( i * strideW ) ] = w[ offsetW + ( j * strideW ) ];
				w[ offsetW + ( j * strideW ) ] = tmp1;

				// Swap eigenvector columns
				dswap( N, Z, strideZ1, offsetZ + ( i * strideZ2 ), Z, strideZ1, offsetZ + ( j * strideZ2 ) );

				if ( info !== 0 ) {
					itmp1 = IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ];
					IFAIL[ offsetIFAIL + ( i * strideIFAIL ) ] = IFAIL[ offsetIFAIL + ( j * strideIFAIL ) ];
					IFAIL[ offsetIFAIL + ( j * strideIFAIL ) ] = itmp1;
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default dstevx;
