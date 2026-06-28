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
import ztfsm from '../../ztfsm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Solves a system of linear equations `A * X = B` with a Hermitian positive definite matrix `A` in Rectangular Full Packed (RFP) format, using the Cholesky factorization computed by `zpftrf`.
*
* If `uplo = 'lower'`, solves `L * L^H * X = B` by solving `L * Y = B` (forward substitution) and then `L^H * X = Y` (back substitution with conjugate transpose).
*
* If `uplo = 'upper'`, solves `U^H * U * X = B` by solving `U^H * Y = B` (forward substitution with conjugate transpose) and then `U * X = Y` (back substitution).
*
* @private
* @param {string} transr - specifies the RFP storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - RFP array of length N*(N+1)/2 containing the Cholesky factor
* @param {integer} strideA - stride for `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - N-by-NRHS right-hand side matrix, overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {integer} status code (0 = success)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* // Pre-factored 3x3 HPD matrix in RFP (TRANSR='no-transpose', UPLO='lower'):
* var A = new Complex128Array( [ 3.162, 0, 0.949, -0.316, 0.316, 0.632, 2.138, 0, 2.646, 0, 0.718, -0.643 ] );
* var B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
* var info = zpftrs( 'no-transpose', 'lower', 3, 1, A, 1, 0, B, 1, 3, 0 );
* // info => 0
*/
function zpftrs( transr, uplo, N, nrhs, A, strideA, offsetA, B, strideB1, strideB2, offsetB ) {
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'lower' ) {
		// Solve L * Y = B
		ztfsm( transr, 'left', 'lower', 'no-transpose', 'non-unit', N, nrhs, CONE, A, strideA, offsetA, B, strideB1, strideB2, offsetB );

		// Solve L^H * X = Y
		ztfsm( transr, 'left', 'lower', 'conjugate-transpose', 'non-unit', N, nrhs, CONE, A, strideA, offsetA, B, strideB1, strideB2, offsetB );
	} else {
		// Solve U^H * Y = B
		ztfsm( transr, 'left', 'upper', 'conjugate-transpose', 'non-unit', N, nrhs, CONE, A, strideA, offsetA, B, strideB1, strideB2, offsetB );

		// Solve U * X = Y
		ztfsm( transr, 'left', 'upper', 'no-transpose', 'non-unit', N, nrhs, CONE, A, strideA, offsetA, B, strideB1, strideB2, offsetB );
	}

	return 0;
}


// EXPORTS //

export default zpftrs;
