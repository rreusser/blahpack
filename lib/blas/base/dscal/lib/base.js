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

// VARIABLES //

var M = 5;


// MAIN //

/**
* Scales a vector by a constant.
*
* @private
* @param {PositiveInteger} N - number of indexed elements
* @param {number} da - scalar
* @param {Float64Array} x - input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @returns {Float64Array} input array
*/
function dscal( N, da, x, strideX, offsetX ) {
	var ix;
	var m;
	var i;

	if ( N <= 0 ) {
		return x;
	}
	ix = offsetX;

	// Use unrolled loops if stride is 1...
	if ( strideX === 1 ) {
		m = N % M;
		if ( m > 0 ) {
			for ( i = 0; i < m; i++ ) {
				x[ ix ] *= da;
				ix += 1;
			}
		}
		if ( N < M ) {
			return x;
		}
		for ( i = m; i < N; i += M ) {
			x[ix] *= da;
			x[ix+1] *= da;
			x[ix+2] *= da;
			x[ix+3] *= da;
			x[ix+4] *= da;
			ix += M;
		}
		return x;
	}
	for ( i = 0; i < N; i++ ) {
		x[ ix ] *= da;
		ix += strideX;
	}
	return x;
}


// EXPORTS //

export default dscal;
