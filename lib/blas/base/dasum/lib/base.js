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

/* eslint-disable max-len */

// MAIN //

/**
* Computes the sum of absolute values of a double-precision floating-point vector.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} stride - stride length for `x`
* @param {NonNegativeInteger} offset - starting index for `x`
* @returns {number} sum of absolute values
*/
function dasum( N, x, stride, offset ) {
	var dtemp;
	var ix;
	var m;
	var i;

	dtemp = 0.0;
	if ( N <= 0 || stride <= 0 ) {
		return dtemp;
	}
	ix = offset;

	// Use unrolled loops if stride is equal to 1...
	if ( stride === 1 ) {
		m = N % 6;
		if ( m > 0 ) {
			for ( i = 0; i < m; i++ ) {
				dtemp += Math.abs( x[ ix ] );
				ix += 1;
			}
		}
		if ( N < 6 ) {
			return dtemp;
		}
		for ( i = m; i < N; i += 6 ) {
			dtemp += Math.abs( x[ix] ) + Math.abs( x[ix+1] ) + Math.abs( x[ix+2] ) + Math.abs( x[ix+3] ) + Math.abs( x[ix+4] ) + Math.abs( x[ix+5] );
			ix += 6;
		}
		return dtemp;
	}
	for ( i = 0; i < N; i++ ) {
		dtemp += Math.abs( x[ ix ] );
		ix += stride;
	}
	return dtemp;
}


// EXPORTS //

export default dasum;
