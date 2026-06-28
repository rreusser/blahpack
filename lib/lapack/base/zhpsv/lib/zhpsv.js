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

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the solution to a complex system of linear equations `A * X = B` where A is Hermitian in packed storage.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of the Hermitian matrix A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns in B
* @param {Complex128Array} AP - Hermitian matrix A in packed storage
* @param {integer} strideAP - stride for `AP`
* @param {Int32Array} IPIV - output pivot indices, length N
* @param {integer} strideIPIV - stride for `IPIV`
* @param {Complex128Array} B - input/output N-by-NRHS matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zhpsv( uplo, N, nrhs, AP, strideAP, IPIV, strideIPIV, B, LDB ) { // eslint-disable-line max-len, max-params
	var oipiv;
	var oap;

	oap = stride2offset( ( N * ( N + 1 ) ) / 2, strideAP ); // eslint-disable-line max-len
	oipiv = stride2offset( N, strideIPIV );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( uplo, N, nrhs, AP, strideAP, oap, IPIV, strideIPIV, oipiv, B, 1, LDB, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhpsv;
