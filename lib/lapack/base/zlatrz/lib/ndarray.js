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

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Factors the M-by-(M+l) complex upper trapezoidal matrix `[ A1 A2 ] = [ A(0:M-1,0:M-1) A(0:M-1,N-l:N-1) ]` as `( R  0 ) * Z` by means of unitary transformations.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} l - number of columns containing the meaningful part of the Householder vectors
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors of the elementary reflectors
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} work - workspace array (length at least `M`)
* @param {integer} strideWork - stride length for `work` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `work` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {Complex128Array} `A`
*/
function zlatrz( M, N, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, work, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, work, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlatrz;
