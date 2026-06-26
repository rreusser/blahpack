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
import zheev from '../../zheev/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes all the eigenvalues, and optionally, the eigenvectors of a complex.
* generalized Hermitian-definite eigenproblem:
*   A_x = lambda_B_x  (itype=1)
_   A_B_x = lambda_x  (itype=2)
*   B_A_x = lambda*x  (itype=3)
*
* Here A and B are assumed to be Hermitian and B is also positive definite.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - 'compute-vectors' for eigenvalues and eigenvectors, 'no-vectors' for eigenvalues only
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input/output Hermitian matrix; on exit, eigenvectors if jobz='compute-vectors'
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - Hermitian positive definite matrix; on exit, Cholesky factor
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {integer} lwork - length of WORK array (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if zpotrf or zheev failed
*/
function zhegv( itype, jobz, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, w, strideW, offsetW, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) {
	var wantz;
	var upper;
	var trans;
	var neig;
	var info;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	wantz = ( jobz === 'compute-vectors' );
	upper = ( uplo === 'upper' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;
	sb1 = strideB1;
	sb2 = strideB2;

	// Form a Cholesky factorization of B
	info = zpotrf( uplo, N, B, sb1, sb2, offsetB );
	if ( info !== 0 ) {
		// Return N + info to indicate B is not positive definite
		return N + info;
	}

	// Transform problem to standard eigenvalue problem and solve
	zhegst( itype, uplo, N, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );
	info = zheev( jobz, uplo, N, A, sa1, sa2, offsetA, w, strideW, offsetW, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK );

	if ( wantz ) {
		// Backtransform eigenvectors to the original problem
		neig = N;
		if ( info > 0 ) {
			neig = info - 1;
		}
		if ( itype === 1 || itype === 2 ) {
			// For A*x = lambda*B*x and A*B*x = lambda*x:
			// Backtransform eigenvectors: x = inv(L)^H * y or inv(U) * y
			if ( upper ) {
				trans = 'no-transpose';
			} else {
				trans = 'conjugate-transpose';
			}
			ztrsm( 'left', uplo, trans, 'non-unit', N, neig, CONE,
				B, sb1, sb2, offsetB,
				A, sa1, sa2, offsetA
			);
		} else if ( itype === 3 ) {
			// For B*A*x = lambda*x:
			// Backtransform eigenvectors: x = L*y or U^H*y
			if ( upper ) {
				trans = 'conjugate-transpose';
			} else {
				trans = 'no-transpose';
			}
			ztrmm( 'left', uplo, trans, 'non-unit', N, neig, CONE,
				B, sb1, sb2, offsetB,
				A, sa1, sa2, offsetA
			);
		}
	}

	return info;
}


// EXPORTS //

export default zhegv;
