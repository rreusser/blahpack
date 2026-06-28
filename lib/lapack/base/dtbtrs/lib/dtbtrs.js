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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a triangular banded system of the form `A*X = B`, `A^T*X = B`, or `A^H*X = B` where A is a triangular band matrix of order N with kd super- or sub-diagonals, and B is an N-by-NRHS matrix.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - specifies whether A is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} trans - specifies the form of the system (`'no-transpose'` or `'transpose'`)
* @param {string} diag - specifies whether A is unit triangular (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- or sub-diagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AB - band matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dtbtrs( order, uplo, trans, diag, N, kd, nrhs, AB, LDAB, B, LDB ) {
	var sab1;
	var sab2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	return base( uplo, trans, diag, N, kd, nrhs, AB, sab1, sab2, 0, B, sb1, sb2, 0 );
}


// EXPORTS //

export default dtbtrs;
