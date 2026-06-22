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

// MAIN //

/**
* Applies a modified Givens plane rotation.
*
* The modified Givens rotation matrix `H` is determined by the `param` array.
* `param[0]` is `DFLAG` which determines the form of `H`:
*
* ```text
* DFLAG=-1:            DFLAG=0:             DFLAG=1:             DFLAG=-2:
* (DH11  DH12)         (1     DH12)         (DH11  1   )         (1  0)
* (DH21  DH22)         (DH21  1   )         (-1    DH22)         (0  1)
* ```
*
* `param[1]` = `DH11`, `param[2]` = `DH21`, `param[3]` = `DH12`,
* `param[4]` = `DH22`.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} param - parameters for the modified Givens transformation
* @param {integer} strideParam - `param` stride length
* @param {NonNegativeInteger} offsetParam - starting index for `param`
* @returns {Float64Array} `y`
*/
function drotm( N, x, strideX, offsetX, y, strideY, offsetY, param, strideParam, offsetParam ) {
	var dflag;
	var dh11;
	var dh12;
	var dh21;
	var dh22;
	var ix;
	var iy;
	var w;
	var z;
	var i;

	dflag = param[ offsetParam ];
	if ( N <= 0 || dflag === -2.0 ) {
		return y;
	}
	ix = offsetX;
	iy = offsetY;
	if ( dflag < 0.0 ) {
		// DFLAG = -1: full H matrix
		dh11 = param[ offsetParam + strideParam ];
		dh21 = param[ offsetParam + ( strideParam * 2 ) ];
		dh12 = param[ offsetParam + ( strideParam * 3 ) ];
		dh22 = param[ offsetParam + ( strideParam * 4 ) ];
		for ( i = 0; i < N; i += 1 ) {
			w = x[ ix ];
			z = y[ iy ];
			x[ ix ] = ( w * dh11 ) + ( z * dh12 );
			y[ iy ] = ( w * dh21 ) + ( z * dh22 );
			ix += strideX;
			iy += strideY;
		}
	} else if ( dflag === 0.0 ) {
		// DFLAG = 0: H = [ 1  DH12; DH21  1 ]
		dh12 = param[ offsetParam + ( strideParam * 3 ) ];
		dh21 = param[ offsetParam + ( strideParam * 2 ) ];
		for ( i = 0; i < N; i += 1 ) {
			w = x[ ix ];
			z = y[ iy ];
			x[ ix ] = w + ( z * dh12 );
			y[ iy ] = ( w * dh21 ) + z;
			ix += strideX;
			iy += strideY;
		}
	} else {
		// DFLAG = 1: H = [ DH11  1; -1  DH22 ]
		dh11 = param[ offsetParam + strideParam ];
		dh22 = param[ offsetParam + ( strideParam * 4 ) ];
		for ( i = 0; i < N; i += 1 ) {
			w = x[ ix ];
			z = y[ iy ];
			x[ ix ] = ( w * dh11 ) + z;
			y[ iy ] = -w + ( dh22 * z );
			ix += strideX;
			iy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default drotm;
