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

import zptts2 from '../../zptts2/lib/base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system A*X = B
* using the L*D*L^H or U^H*D*U factorization of A computed by zpttrf.
*
* D is a diagonal matrix (real) specified in the vector D, U (or L) is a unit
* bidiagonal matrix whose superdiagonal (subdiagonal) is specified in the
* complex vector E, and X and B are N by NRHS complex matrices.
*
* @private
* @param {string} uplo - `'upper'` for U^H*D*U factorization, `'lower'` for L*D*L^H factorization
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements of D (real), length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - off-diagonal elements of L or U, length N-1
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Complex128Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zpttrs( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) {
	var iuplo;

	// Quick return if possible:
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Decode UPLO:
	if ( uplo === 'upper' ) {
		iuplo = 1;
	} else {
		iuplo = 0;
	}

	// Solve A * X = B by calling zptts2 with all columns at once:
	zptts2( iuplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB );

	return 0;
}


// EXPORTS //

export default zpttrs;
