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
* Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian-definite generalized eigenproblem in packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - packed Hermitian matrix A (length N*(N+1)/2)
* @param {Complex128Array} BP - packed Hermitian positive definite matrix B (length N*(N+1)/2)
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {Complex128Array} Z - output eigenvector matrix (N x M)
* @param {PositiveInteger} LDZ - leading dimension of Z (in complex elements)
* @param {Complex128Array} WORK - complex workspace (length >= 2*N)
* @param {Float64Array} RWORK - real workspace (length >= 7*N)
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fifth argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zhpgvx( order, itype, jobz, range, uplo, N, AP, BP, vl, vu, il, iu, abstol, out, w, Z, LDZ, WORK, RWORK, IWORK, IFAIL ) {
	var sz1;
	var sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 7 * N );
		RWORK = new Float64Array( minRwork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, 5 * N );
		IWORK = new Int32Array( minIwork );
	}
	return base( itype, jobz, range, uplo, N, AP, 1, 0, BP, 1, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, sz1, sz2, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhpgvx;
