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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the splitting points with threshold based on the representation.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix, length N
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - subdiagonal elements (in/out), length N
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} E2 - squares of subdiagonal elements (in/out), length N
* @param {integer} strideE2 - stride length for `E2`
* @param {number} spltol - splitting threshold
* @param {number} tnrm - norm of the matrix
* @param {Int32Array} nsplit - output: number of blocks (nsplit[0])
* @param {Int32Array} ISPLIT - output: splitting points array
* @param {integer} strideISPLIT - stride length for `ISPLIT`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - status code (0 = success)
*/
function dlarra( N, d, strideD, e, strideE, E2, strideE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT ) {
	var offsetISPLIT = stride2offset( N, strideISPLIT );
	var offsetE2 = stride2offset( N, strideE2 );
	var offsetD = stride2offset( N, strideD );
	var offsetE = stride2offset( N, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT, offsetISPLIT );
}


// EXPORTS //

export default dlarra;
