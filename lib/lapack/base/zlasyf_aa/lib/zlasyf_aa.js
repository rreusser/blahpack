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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Factorize a panel of a complex symmetric matrix using Aasen's algorithm.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`)
* @param {integer} j1 - location (1 or 2) of the first row/column of the panel within the enclosing submatrix
* @param {NonNegativeInteger} M - submatrix dimension
* @param {NonNegativeInteger} nb - panel width
* @param {Complex128Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - output pivot vector
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} H - workspace matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} WORK - scratch workspace, length at least `M`
* @param {integer} strideWork - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max(1,M)`
* @throws {RangeError} twelfth argument must be greater than or equal to `max(1,M)`
* @returns {integer} `0`
*/
function zlasyfAa( order, uplo, j1, M, nb, A, LDA, IPIV, strideIPIV, offsetIPIV, H, LDH, WORK, strideWork ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var sh1;
	var sh2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDH < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,M). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sh1 = 1;
		sh2 = LDH;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sh1 = LDH;
		sh2 = 1;
	}
	return base( uplo, j1, M, nb, A, sa1, sa2, 0, IPIV, strideIPIV, offsetIPIV, H, sh1, sh2, 0, WORK, strideWork, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlasyfAa;
