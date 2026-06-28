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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a triangular system of equations with the scale factors set to prevent overflow.
*
* Solves one of the triangular systems
*
* ```text
* A * X = B * diag(scale)  or  A**T * X = B * diag(scale)
* ```
*
* where A is an N-by-N upper or lower triangular matrix, X and B are N-by-NRHS
* matrices, and scale is an NRHS-element vector of scaling factors.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if `CNORM` already contains column norms, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} A - input N-by-N triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} X - in/out N-by-NRHS right-hand side matrix, overwritten by solution
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} SCALE - out: scale factors of length `NRHS`
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {NonNegativeInteger} offsetSCALE - starting index for `SCALE`
* @param {Float64Array} CNORM - in/out column-norm workspace of length `N`
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {NonNegativeInteger} offsetCNORM - starting index for `CNORM`
* @param {Float64Array} work - workspace of length >= `nba*max(nba, min(nrhs, 32)) + nba*nba + 40` where `nba = ceil(N/8)`
* @param {integer} strideWork - stride length for `work` (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for `work`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {TypeError} fourth argument must be a valid norm-in flag
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function dlatrs3( uplo, trans, diag, normin, N, nrhs, A, strideA1, strideA2, offsetA, X, strideX1, strideX2, offsetX, SCALE, strideSCALE, offsetSCALE, CNORM, strideCNORM, offsetCNORM, work, strideWork, offsetWork ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( normin !== 'yes' && normin !== 'no' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid norm-in flag. Value: `%s`.', normin ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, trans, diag, normin, N, nrhs, A, strideA1, strideA2, offsetA, X, strideX1, strideX2, offsetX, SCALE, strideSCALE, offsetSCALE, CNORM, strideCNORM, offsetCNORM, work, strideWork, offsetWork );
}


// EXPORTS //

export default dlatrs3;
