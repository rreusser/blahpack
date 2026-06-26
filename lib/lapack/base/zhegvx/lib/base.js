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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zhegst from '../../zhegst/lib/base.js';
import zheevx from '../../zheevx/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes selected eigenvalues, and optionally, eigenvectors of a complex.
* generalized Hermitian-definite eigenproblem:
*   A_x = lambda_B_x  (itype=1)
_   A_B_x = lambda_x  (itype=2)
*   B_A_x = lambda*x  (itype=3)
*
* Here A and B are assumed to be Hermitian and B is also positive definite.
* Eigenvalues and eigenvectors can be selected by specifying a range of
* values or a range of indices for the desired eigenvalues.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - 'compute-vectors' or 'no-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input/output Hermitian matrix; destroyed on exit
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Complex128Array} B - Hermitian positive definite matrix; on exit, Cholesky factor
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output eigenvector matrix
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
* @returns {integer} info - 0 if successful, >0 if failed
*/
function zhegvx( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) {
	var wantz;
	var upper;
	var trans;
	var info;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sz1;
	var sz2;
	var M;

	wantz = ( jobz === 'compute-vectors' );
	upper = ( uplo === 'upper' );

	// Quick return if possible
	out.M = 0;
	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;
	sz1 = strideZ1;
	sz2 = strideZ2;

	// Form a Cholesky factorization of B
	info = zpotrf( uplo, N, B, sb1, sb2, offsetB );
	if ( info !== 0 ) {
		// Return N + info to indicate B is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem
	zhegst( itype, uplo, N, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );

	// Solve the standard eigenvalue problem
	info = zheevx( jobz, range, uplo, N, A, sa1, sa2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, sz1, sz2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL );

	if ( wantz ) {
		// Backtransform eigenvectors to the original problem
		M = out.M;
		if ( info > 0 ) {
			M = info - 1;
		}
		if ( itype === 1 || itype === 2 ) {
			// For A*x = lambda*B*x and A*B*x = lambda*x:
			// Backtransform eigenvectors: x = inv(L)^H * y or inv(U) * y
			if ( upper ) {
				trans = 'no-transpose';
			} else {
				trans = 'conjugate-transpose';
			}
			ztrsm( 'left', uplo, trans, 'non-unit', N, M, CONE,
				B, sb1, sb2, offsetB,
				Z, sz1, sz2, offsetZ
			);
		} else if ( itype === 3 ) {
			// For B*A*x = lambda*x:
			// Backtransform eigenvectors: x = L*y or U^H*y
			if ( upper ) {
				trans = 'conjugate-transpose';
			} else {
				trans = 'no-transpose';
			}
			ztrmm( 'left', uplo, trans, 'non-unit', N, M, CONE,
				B, sb1, sb2, offsetB,
				Z, sz1, sz2, offsetZ
			);
		}
	}

	return info;
}


// EXPORTS //

export default zhegvx;
