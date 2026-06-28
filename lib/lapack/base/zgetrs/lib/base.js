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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaswp from '../../zlaswp/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Solves a system of linear equations.
* `A*X = B`,  `A^T*X = B`,  or  `A^H * X = B`
* with a general N-by-N matrix A using the LU factorization computed by
* zgetrf/zgetrf2.
*
* IPIV must contain 0-based pivot indices (as produced by zgetrf/zgetrf2).
*
* @private
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - LU-factored N-by-N matrix (from zgetrf)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Complex128Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @returns {integer} info - 0 if successful
*/
function zgetrs( trans, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( trans === 'no-transpose' ) {
		// Solve A * X = B.

		// Apply row interchanges to the right-hand sides.
		zlaswp( nrhs, B, strideB1, strideB2, offsetB, 0, N - 1, IPIV, strideIPIV, offsetIPIV, 1 );

		// Solve L * Y = P * B (forward substitution, L is unit lower triangular)
		ztrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve U * X = Y (back substitution)
		ztrsm( 'left', 'upper', 'no-transpose', 'non-unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);
	} else if ( trans === 'transpose' ) {
		// Solve A^T * X = B.

		// Solve U^T * Y = B (forward substitution with U transposed)
		ztrsm( 'left', 'upper', 'transpose', 'non-unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve L^T * X = Y (back substitution with L transposed, unit diagonal)
		ztrsm( 'left', 'lower', 'transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Apply row interchanges in reverse order
		zlaswp( nrhs, B, strideB1, strideB2, offsetB, N - 1, 0, IPIV, strideIPIV, offsetIPIV, -1 );
	} else {
		// Solve A^H * X = B (conjugate transpose).

		// Solve U^H * Y = B (forward substitution with U conjugate-transposed)
		ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve L^H * X = Y (back substitution with L conjugate-transposed, unit diagonal)
		ztrsm( 'left', 'lower', 'conjugate-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Apply row interchanges in reverse order
		zlaswp( nrhs, B, strideB1, strideB2, offsetB, N - 1, 0, IPIV, strideIPIV, offsetIPIV, -1 );
	}

	return 0;
}


// EXPORTS //

export default zgetrs;
