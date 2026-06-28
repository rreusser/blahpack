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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a triangular system with scaling to prevent overflow, where the matrix is in packed storage.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix of length N*(N+1)/2
* @param {Float64Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} scale - out: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride length for `CNORM`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dlatps( uplo, trans, diag, normin, N, AP, x, strideX, scale, CNORM, strideCNORM ) {
	var ox = stride2offset( N, strideX );
	var oc = stride2offset( N, strideCNORM );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( normin !== 'no' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `normin` value. Value: `%s`.', normin ) );
	}
	return base( uplo, trans, diag, normin, N, AP, 1, 0, x, strideX, ox, scale, CNORM, strideCNORM, oc );
}


// EXPORTS //

export default dlatps;
