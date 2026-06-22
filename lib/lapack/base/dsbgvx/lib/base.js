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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpbstf from '../../dpbstf/lib/base.js';
import dsbgst from '../../dsbgst/lib/base.js';
import dsbtrd from '../../dsbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import dstein from '../../dstein/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real generalized symmetric-definite banded eigenproblem A_x = lambda_B_x.
*
* A and B are assumed to be symmetric and banded, and B is also positive definite.
*
* ## Algorithm
*
* 1.  Form a split Cholesky factorization of B via dpbstf.
* 2.  Transform to standard eigenvalue problem via dsbgst.
* 3.  Reduce to tridiagonal form via dsbtrd.
* 4.  If all eigenvalues requested and abstol <= 0, use dsterf/dsteqr fast path.
* 5.  Otherwise use dstebz for selective eigenvalue computation and dstein + dgemv back-transform for eigenvectors.
*
* `M` is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: `out.M`.
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {integer} ka - number of super- (or sub-) diagonals of A
* @param {integer} kb - number of super- (or sub-) diagonals of B
* @param {Float64Array} AB - band matrix A in band storage, dimension (ka+1, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} BB - band matrix B in band storage, dimension (kb+1, N)
* @param {integer} strideBB1 - stride of the first dimension of `BB`
* @param {integer} strideBB2 - stride of the second dimension of `BB`
* @param {NonNegativeInteger} offsetBB - starting index for `BB`
* @param {Float64Array} Q - output matrix for transformation (N-by-N), referenced only if jobz = `'compute-vectors'`
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Z - output matrix for eigenvectors (N-by-M), referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 7*N)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride length for `IFAIL`
* @param {NonNegativeInteger} offsetIFAIL - starting index for `IFAIL`
* @returns {integer} info - 0 if successful; if info > 0 and <= N, dstein failed to converge; if info > N, dpbstf returned info = info - N (B is not positive definite)
*/
function dsbgvx( jobz, range, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) {
	var indeig;
	var nsplit;
	var indibl;
	var indisp;
	var indiwo;
	var indwrk;
	var alleig;
	var wantz;
	var indee;
	var order;
	var itmp1;
	var Mout;
	var info;
	var indd;
	var inde;
	var tmp1;
	var test;
	var vect;
	var jj;
	var M;
	var i;
	var j;

	wantz = ( jobz === 'compute-vectors' );
	alleig = ( range === 'all' );
	indeig = ( range === 'index' );

	info = 0;
	M = 0;

	// Quick return if possible
	if ( N === 0 ) {
		out.M = 0;
		return 0;
	}

	// Form a split Cholesky factorization of B
	info = dpbstf( uplo, N, kb, BB, strideBB1, strideBB2, offsetBB );
	if ( info !== 0 ) {
		out.M = 0;
		return N + info;
	}

	// Transform problem to standard eigenvalue problem
	dsbgst( ( ( wantz ) ? 'update' : 'none' ), uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK );

	// Partition WORK: d at indd, e at inde, scratch at indwrk
	indd = offsetWORK;
	inde = indd + ( N * strideWORK );
	indwrk = inde + ( N * strideWORK );

	// Reduce symmetric band matrix to tridiagonal form
	if ( wantz ) {
		vect = 'update';
	} else {
		vect = 'none';
	}
	dsbtrd( vect, uplo, N, ka, AB, strideAB1, strideAB2, offsetAB, WORK, strideWORK, indd, WORK, strideWORK, inde, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, indwrk );

	// If all eigenvalues are desired and ABSTOL is less than or equal to zero, use fast path
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	if ( ( alleig || test ) && abstol <= 0.0 ) {
		dcopy( N, WORK, strideWORK, indd, w, strideW, offsetW );
		indee = indwrk + ( 2 * N * strideWORK );

		if ( wantz ) {
			dlacpy( 'all', N, N, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ );
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
		indisp = indibl + ( N * strideIWORK );
		indiwo = indisp + ( N * strideIWORK );

		// Allocate M and nsplit as arrays for dstebz output
		Mout = new Int32Array( 1 );
		nsplit = new Int32Array( 1 );

		dstebz( range, order, N, vl, vu, il, iu, abstol, WORK, strideWORK, indd, WORK, strideWORK, inde, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWORK, indibl, IWORK, strideIWORK, indisp, WORK, strideWORK, indwrk, IWORK, strideIWORK, indiwo );

		M = Mout[ 0 ];

		if ( wantz && M > 0 ) {
			info = dstein( N, WORK, strideWORK, indd, WORK, strideWORK, inde, M, w, strideW, offsetW, IWORK, strideIWORK, indibl, IWORK, strideIWORK, indisp, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indwrk, IWORK, strideIWORK, indiwo, IFAIL, strideIFAIL, offsetIFAIL );

			// Transform eigenvectors back to original space via Z = Q * Z
			for ( j = 0; j < M; j++ ) {
				dcopy( N, Z, strideZ1, offsetZ + ( j * strideZ2 ), WORK, strideWORK, offsetWORK );
				dgemv( 'no-transpose', N, N, 1.0, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, 0.0, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
			}
		}
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
				itmp1 = IWORK[ offsetIWORK + ( i * strideIWORK ) ];
				w[ offsetW + ( i * strideW ) ] = w[ offsetW + ( j * strideW ) ];
				IWORK[ offsetIWORK + ( i * strideIWORK ) ] = IWORK[ offsetIWORK + ( j * strideIWORK ) ];
				w[ offsetW + ( j * strideW ) ] = tmp1;
				IWORK[ offsetIWORK + ( j * strideIWORK ) ] = itmp1;
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

export default dsbgvx;
