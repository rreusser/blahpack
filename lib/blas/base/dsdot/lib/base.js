/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
* Computes the dot product of two vectors with extended precision accumulation.
*
* @private
* @param {PositiveInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @returns {number} dot product
*/
function dsdot( N, x, strideX, offsetX, y, strideY, offsetY ) {
	var dtemp;
	var ix;
	var iy;
	var m;
	var i;

	dtemp = 0.0;
	if ( N <= 0 ) {
		return dtemp;
	}
	ix = offsetX;
	iy = offsetY;

	// Use unrolled loops if both strides are equal to 1...
	if ( strideX === 1 && strideY === 1 ) {
		m = N % M;
		if ( m > 0 ) {
			for ( i = 0; i < m; i++ ) {
				dtemp += x[ ix ] * y[ iy ];
				ix += 1;
				iy += 1;
			}
		}
		if ( N < M ) {
			return dtemp;
		}
		for ( i = m; i < N; i += M ) {
			dtemp += (x[ix] * y[iy]) + (x[ix+1] * y[iy+1]) + (x[ix+2] * y[iy+2]) + (x[ix+3] * y[iy+3]) + (x[ix+4] * y[iy+4]); // eslint-disable-line max-len
			ix += M;
			iy += M;
		}
		return dtemp;
	}
	for ( i = 0; i < N; i++ ) {
		dtemp += x[ ix ] * y[ iy ];
		ix += strideX;
		iy += strideY;
	}
	return dtemp;
}


// EXPORTS //

export default dsdot;
