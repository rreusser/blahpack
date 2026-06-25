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
import base from './base.js';


// MAIN //

/**
* Refines eigenvalue approximations of a symmetric tridiagonal matrix using bisection given initial intervals.
*
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal elements of T, length N
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} E2 - squares of the subdiagonal elements of T, length N-1
* @param {integer} strideE2 - stride length for `E2`
* @param {integer} ifirst - index of the first eigenvalue to be computed (1-based)
* @param {integer} ilast - index of the last eigenvalue to be computed (1-based)
* @param {number} rtol - tolerance for convergence of bisection intervals
* @param {integer} offset - offset for the arrays w and WERR
* @param {Float64Array} w - eigenvalue approximations (in/out), length N
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} WERR - error estimates for eigenvalues (in/out), length N
* @param {integer} strideWERR - stride length for `WERR`
* @param {Float64Array} WORK - workspace array, length 2*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {Int32Array} IWORK - integer workspace array, length 2*N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {number} pivmin - minimum pivot in the Sturm sequence for T
* @param {number} spdiam - spectral diameter of T
* @returns {integer} info - 0 on success
*/
function dlarrj( N, d, strideD, E2, strideE2, ifirst, ilast, rtol, offset, w, strideW, WERR, strideWERR, WORK, strideWORK, IWORK, strideIWORK, pivmin, spdiam ) {
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, 2 * N );
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	var oIWORK = stride2offset( 2 * N, strideIWORK );
	var oWERR = stride2offset( N, strideWERR );
	var oWORK = stride2offset( 2 * N, strideWORK );
	var oE2 = stride2offset( N, strideE2 );
	var oD = stride2offset( N, strideD );
	var oW = stride2offset( N, strideW );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, oD, E2, strideE2, oE2, ifirst, ilast, rtol, offset, w, strideW, oW, WERR, strideWERR, oWERR, WORK, strideWORK, oWORK, IWORK, strideIWORK, oIWORK, pivmin, spdiam );
}


// EXPORTS //

export default dlarrj;
