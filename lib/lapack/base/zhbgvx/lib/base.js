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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zpbstf from '../../zpbstf/lib/base.js';
import zhbgst from '../../zhbgst/lib/base.js';
import zhbtrd from '../../zhbtrd/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import zsteqr from '../../zsteqr/lib/base.js';
import dstebz from '../../dstebz/lib/base.js';
import zstein from '../../zstein/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite banded eigenproblem A\*x = lambda\*B\*x.
*
* A and B are assumed to be Hermitian and banded, and B is also positive definite.
*
* ## Algorithm
*
* 1.  Form a split Cholesky factorization of B via zpbstf.
* 2.  Transform to standard eigenvalue problem via zhbgst.
* 3.  Reduce to tridiagonal form via zhbtrd.
* 4.  If all eigenvalues requested and abstol <= 0, use dsterf/zsteqr fast path.
* 5.  Otherwise use dstebz for selective eigenvalue computation and zstein + zgemv back-transform for eigenvectors.
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
* @param {Complex128Array} AB - band matrix A in band storage, dimension (ka+1, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {Complex128Array} BB - band matrix B in band storage, dimension (kb+1, N)
* @param {integer} strideBB1 - stride of the first dimension of `BB` (complex elements)
* @param {integer} strideBB2 - stride of the second dimension of `BB` (complex elements)
* @param {NonNegativeInteger} offsetBB - starting index for `BB` (complex elements)
* @param {Complex128Array} Q - output matrix for transformation (N-by-N), referenced only if jobz = `'compute-vectors'`
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Complex128Array} Z - output matrix for eigenvectors (N-by-M), referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @param {Complex128Array} WORK - complex workspace array (length >= N)
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= 7*N)
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride length for `IFAIL`
* @param {NonNegativeInteger} offsetIFAIL - starting index for `IFAIL`
* @returns {integer} info - 0 if successful; if info > 0 and <= N, zstein failed to converge; if info > N, zpbstf returned info = info - N (B is not positive definite)
*/
function zhbgvx( jobz, range, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) {
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
	info = zpbstf( uplo, N, kb, BB, strideBB1, strideBB2, offsetBB );
	if ( info !== 0 ) {
		out.M = 0;
		return N + info;
	}

	// Transform problem to standard eigenvalue problem
	zhbgst( ( ( wantz ) ? 'update' : 'none' ), uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Partition RWORK: d at indd, e at inde, scratch at indwrk
	indd = offsetRWork;
	inde = indd + ( N * strideRWork );
	indwrk = inde + ( N * strideRWork );

	// Reduce Hermitian band matrix to tridiagonal form
	if ( wantz ) {
		vect = 'update';
	} else {
		vect = 'none';
	}
	zhbtrd( vect, uplo, N, ka, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, indd, RWORK, strideRWork, inde, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork );

	// If all eigenvalues are desired and ABSTOL is less than or equal to zero, use fast path
	test = false;
	if ( indeig ) {
		if ( il === 1 && iu === N ) {
			test = true;
		}
	}

	if ( ( alleig || test ) && abstol <= 0.0 ) {
		dcopy( N, RWORK, strideRWork, indd, w, strideW, offsetW );
		indee = indwrk + ( 2 * N * strideRWork );

		if ( wantz ) {
			zlacpy( 'all', N, N, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ );
			dcopy( N - 1, RWORK, strideRWork, inde, RWORK, strideRWork, indee );
			info = zsteqr( 'update', N, w, strideW, offsetW, RWORK, strideRWork, indee, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWork, indwrk );
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
			// If zsteqr/dsterf failed, fall through to dstebz path
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

		dstebz( range, order, N, vl, vu, il, iu, abstol, RWORK, strideRWork, indd, RWORK, strideRWork, inde, Mout, nsplit, w, strideW, offsetW, IWORK, strideIWork, indibl, IWORK, strideIWork, indisp, RWORK, strideRWork, indwrk, IWORK, strideIWork, indiwo );

		M = Mout[ 0 ];

		if ( wantz && M > 0 ) {
			info = zstein( N, RWORK, strideRWork, indd, RWORK, strideRWork, inde, M, w, strideW, offsetW, IWORK, strideIWork, indibl, IWORK, strideIWork, indisp, Z, strideZ1, strideZ2, offsetZ, RWORK, strideRWork, indwrk, IWORK, strideIWork, indiwo, IFAIL, strideIFAIL, offsetIFAIL );

			// Transform eigenvectors back to original space via Z = Q * Z
			for ( j = 0; j < M; j++ ) {
				zcopy( N, Z, strideZ1, offsetZ + ( j * strideZ2 ), WORK, strideWork, offsetWork );
				zgemv( 'no-transpose', N, N, CONE, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, CZERO, Z, strideZ1, offsetZ + ( j * strideZ2 ) );
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
				itmp1 = IWORK[ offsetIWork + ( i * strideIWork ) ];
				w[ offsetW + ( i * strideW ) ] = w[ offsetW + ( j * strideW ) ];
				IWORK[ offsetIWork + ( i * strideIWork ) ] = IWORK[ offsetIWork + ( j * strideIWork ) ];
				w[ offsetW + ( j * strideW ) ] = tmp1;
				IWORK[ offsetIWork + ( j * strideIWork ) ] = itmp1;
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

export default zhbgvx;
