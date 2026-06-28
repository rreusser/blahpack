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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a triangular system of equations with the scale factors set to prevent overflow.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if `CNORM` already contains column norms, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} A - input N-by-N triangular matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} X - in/out N-by-NRHS right-hand side matrix, overwritten by solution
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} SCALE - out: scale factors of length `NRHS`
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {Float64Array} CNORM - in/out column-norm workspace of length `N`
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {Float64Array} work - workspace of length >= `nba*max(nba, min(nrhs, 32)) + nba*nba + 40` where `nba = ceil(N/8)`
* @param {integer} strideWork - stride length for `work` (must be 1)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {TypeError} fifth argument must be a valid norm-in flag
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function dlatrs3( order, uplo, trans, diag, normin, N, nrhs, A, LDA, X, LDX, SCALE, strideSCALE, CNORM, strideCNORM, work, strideWork ) {
	var sa1;
	var sa2;
	var sx1;
	var sx2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( normin !== 'yes' && normin !== 'no' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid norm-in flag. Value: `%s`.', normin ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sx1 = 1;
		sx2 = LDX;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sx1 = LDX;
		sx2 = 1;
	}
	if ( work === null || work === void 0 ) {
		var nba = Math.ceil( N / 8 );
		var minWork = Math.max( 1, 2 * nba * Math.max( nba, Math.min( nrhs, 32)));
		work = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( uplo, trans, diag, normin, N, nrhs, A, sa1, sa2, 0, X, sx1, sx2, 0, SCALE, strideSCALE, 0, CNORM, strideCNORM, 0, work, strideWork, 0 );
}


// EXPORTS //

export default dlatrs3;
