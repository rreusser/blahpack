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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex general matrix to upper Hessenberg form using unblocked algorithm.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} ilo - lower index of the balanced matrix (1-based)
* @param {integer} ihi - upper index of the balanced matrix (1-based)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride of TAU
* @param {integer} offsetTAU - offset into TAU
* @param {(Complex128Array|null)} WORK - workspace array of length at least N (or `null` to allocate internally)
* @param {integer} strideWork - stride of WORK
* @param {integer} offsetWork - offset into WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zgehd2( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var sw;
	var w;

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		w = new Complex128Array( Math.max( 1, N ) );
		sw = 1;
		offsetWork = 0;
	} else {
		w = WORK;
		sw = strideWork;
	}
	return base( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, w, sw, offsetWork );
}


// EXPORTS //

export default zgehd2;
