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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite banded eigenproblem A_x = lambda_B_x.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {integer} ka - number of super- (or sub-) diagonals of A
* @param {integer} kb - number of super- (or sub-) diagonals of B
* @param {Complex128Array} AB - band matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} BB - band matrix B in band storage
* @param {PositiveInteger} LDBB - leading dimension of `BB`
* @param {Float64Array} w - output array for eigenvalues
* @param {integer} strideW - `w` stride length
* @param {Complex128Array} Z - output matrix for eigenvectors
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - `WORK` stride length (in complex elements)
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWORK - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zhbgv( order, jobz, uplo, N, ka, kb, AB, LDAB, BB, LDBB, w, strideW, Z, LDZ, WORK, strideWORK, RWORK, strideRWORK ) {
	var sbb1;
	var sbb2;
	var sab1;
	var sab2;
	var ork;
	var owk;
	var sz1;
	var sz2;
	var ow;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDBB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDBB ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sbb1 = 1;
		sbb2 = LDBB;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sbb1 = LDBB;
		sbb2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 3 * N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	owk = stride2offset( Math.max( 1, N ), strideWORK );
	ork = stride2offset( Math.max( 1, 3 * N ), strideRWORK );
	return base( jobz, uplo, N, ka, kb, AB, sab1, sab2, 0, BB, sbb1, sbb2, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, strideWORK, owk, RWORK, strideRWORK, ork );
}


// EXPORTS //

export default zhbgv;
