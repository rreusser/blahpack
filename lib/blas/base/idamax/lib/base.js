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

// MAIN //

/**
* Finds the index of the first element having the maximum absolute value.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function idamax( N, x, strideX, offsetX ) {
	var dmax;
	var imax;
	var ix;
	var i;

	if ( N < 1 || strideX <= 0 ) {
		return -1;
	}
	if ( N === 1 ) {
		return 0;
	}

	ix = offsetX;
	dmax = Math.abs( x[ ix ] );
	imax = 0;
	ix += strideX;

	for ( i = 1; i < N; i++ ) {
		if ( Math.abs( x[ ix ] ) > dmax ) {
			imax = i;
			dmax = Math.abs( x[ ix ] );
		}
		ix += strideX;
	}
	return imax;
}


// EXPORTS //

export default idamax;
