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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a general real matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} norm - `'one-norm'` or `'inf-norm'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - `WORK` stride length
* @param {Int32Array} IWORK - input array
* @param {integer} strideIWork - `IWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dgecon( order, norm, N, A, LDA, anorm, rcond, WORK, strideWork, IWORK, strideIWork ) {
	var sa1;
	var sa2;
	var ow;
	var oi;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 4*N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	ow = stride2offset( N, strideWork );
	oi = stride2offset( N, strideIWork );
	return base( norm, N, A, sa1, sa2, 0, anorm, rcond, WORK, strideWork, ow, IWORK, strideIWork, oi );
}


// EXPORTS //

export default dgecon;
