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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a real symmetric positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.
*
* @param {string} fact - 'not-factored', 'factored', or 'equilibrate'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AP - packed symmetric positive definite matrix, length N*(N+1)/2
* @param {Float64Array} AFP - factored packed matrix
* @param {Array} equed - single-element array for equilibration status
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (output)
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - backward error bounds (output)
* @param {integer} strideBERR - stride for BERR
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {Int32Array} IWORK - integer workspace array
* @param {integer} strideIWORK - stride for IWORK
* @returns {integer} info
*/
function dppsvx( fact, uplo, N, nrhs, AP, AFP, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK ) {
	var oiwork;
	var oberr;
	var oferr;
	var owork;
	var os;

	os = stride2offset( N, strideS );
	oferr = stride2offset( nrhs, strideFERR );
	oberr = stride2offset( nrhs, strideBERR );
	owork = stride2offset( Math.max( 1, 3 * N ), strideWORK );
	oiwork = stride2offset( N, strideIWORK );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' && fact !== 'equilibrate' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	return base( fact, uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, equed, S, strideS, os, B, 1, LDB, 0, X, 1, LDX, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWORK, owork, IWORK, strideIWORK, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dppsvx;
