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
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, the eigenvectors of a real.
* generalized symmetric-definite eigenproblem in packed storage.
*
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} AP - packed symmetric matrix A; on exit, overwritten
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} BP - packed symmetric positive definite matrix B; on exit, Cholesky factor
* @param {integer} strideBP - stride length for `BP`
* @param {NonNegativeInteger} offsetBP - starting index for `BP`
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Z - output eigenvector matrix (N x N); referenced only if jobz = `'compute-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 3*N)
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} Third argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if dpptrf or dspev failed
*/
function dspgv( itype, jobz, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	var minWork = Math.max( 1, 3 * N );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( itype, jobz, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dspgv;
