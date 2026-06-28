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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system A*X = B, and provides an estimate of the condition number and error bounds on the solution.
*
* @param {string} fact - `'not-factored'` to compute factorization, `'factored'` if already factored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} d - diagonal elements of A (length N, real)
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - off-diagonal elements of A (length N-1, complex)
* @param {integer} strideE - stride for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Float64Array} DF - factored diagonal (length N)
* @param {integer} strideDF - stride for `DF`
* @param {NonNegativeInteger} offsetDF - starting index for `DF`
* @param {Complex128Array} EF - factored off-diagonal (length N-1, complex)
* @param {integer} strideEF - stride for `EF` (in complex elements)
* @param {NonNegativeInteger} offsetEF - starting index for `EF` (in complex elements)
* @param {Complex128Array} B - right-hand side matrix (N-by-NRHS, complex)
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} X - solution matrix (N-by-NRHS, complex, output)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds (length NRHS, output)
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - backward error bounds (length NRHS, output)
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Complex128Array} WORK - complex workspace array (length at least N)
* @param {integer} strideWORK - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length at least N)
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @throws {TypeError} first argument must be a valid factorization type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if D(k)<=0 (not positive definite), N+1 if rcond < machine epsilon
*/
function zptsvx( fact, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( fact !== 'not-factored' && fact !== 'factored' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid factorization type. Value: `%s`.', fact ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( fact, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptsvx;
