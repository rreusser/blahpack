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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex symmetric matrix in packed storage.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - factored packed matrix from zsptrf
* @param {Int32Array} IPIV - pivot indices from zsptrf
* @param {integer} strideIPIV - stride for IPIV
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - output: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least 2*N
* @param {integer} strideWORK - stride for WORK
* @throws {TypeError} first argument must be a valid matrix triangle
* @returns {integer} info - 0 if successful
*/
function zspcon( uplo, N, AP, IPIV, strideIPIV, anorm, rcond, WORK, strideWORK ) {
	var oipiv;
	var owork;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	oipiv = stride2offset( N, strideIPIV );
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, strideWORK, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zspcon;
