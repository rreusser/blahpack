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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations `A*X = B` with a complex symmetric (NOT Hermitian) matrix `A` using the factorization computed by `zsytrf_rk`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Complex128Array} A - factored matrix from `zsytrf_rk`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} e - super- or sub-diagonal entries of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {Int32Array} IPIV - pivot indices from `zsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Complex128Array} B - input/output right-hand side / solution matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max(1,N)`
* @throws {RangeError} twelfth argument must be greater than or equal to `max(1,N)`
* @returns {integer} status code (0 = success)
*/
function zsytrs3( order, uplo, N, nrhs, A, LDA, e, strideE, IPIV, strideIPIV, B, LDB ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var oe;
	var oi;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	oe = stride2offset( N, strideE );
	oi = stride2offset( N, strideIPIV );
	return base( uplo, N, nrhs, A, sa1, sa2, 0, e, strideE, oe, IPIV, strideIPIV, oi, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zsytrs3;
