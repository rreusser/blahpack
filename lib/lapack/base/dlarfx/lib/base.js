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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dlarf from '../../dlarf/lib/base.js';


// VARIABLES //

var ZERO = 0.0;


// MAIN //

/**
* Applies an elementary reflector H to a real M-by-N matrix C, from either.
* the left or the right. H is represented in the form:
*
*   H = I - tau _ v _ v^T
*
* where tau is a real scalar and v is a real vector.
*
* If tau = 0, then H is taken to be the unit matrix.
*
* This version uses inline code if H has order <= 10.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Float64Array} v - the vector v in the reflector
* @param {integer} strideV - stride for v
* @param {NonNegativeInteger} offsetV - starting index for v
* @param {number} tau - the scalar tau
* @param {Float64Array} C - the M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace (length N if side=`'left'`, length M if side=`'right'`)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {void}
*/
function dlarfx( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var sum;
	var dim;
	var vv;
	var tt;
	var i;
	var j;

	if ( tau === ZERO ) {
		return;
	}

	if ( side === 'left' ) {
		// Form H * C
		dim = M;
		if ( dim >= 1 && dim <= 10 ) {
			// Inline application
			vv = new Float64Array( dim );
			tt = new Float64Array( dim );
			for ( i = 0; i < dim; i++ ) {
				vv[ i ] = v[ offsetV + i * strideV ];
				tt[ i ] = tau * vv[ i ];
			}
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;
				for ( i = 0; i < dim; i++ ) {
					sum += vv[ i ] * C[ offsetC + i * strideC1 + j * strideC2 ];
				}
				for ( i = 0; i < dim; i++ ) {
					C[ offsetC + i * strideC1 + j * strideC2 ] -= sum * tt[ i ];
				}
			}
			return;
		}
		// Fallback to general dlarf
		dlarf( 'left', M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else {
		// Form C * H
		dim = N;
		if ( dim >= 1 && dim <= 10 ) {
			// Inline application
			vv = new Float64Array( dim );
			tt = new Float64Array( dim );
			for ( i = 0; i < dim; i++ ) {
				vv[ i ] = v[ offsetV + i * strideV ];
				tt[ i ] = tau * vv[ i ];
			}
			for ( j = 0; j < M; j++ ) {
				sum = 0.0;
				for ( i = 0; i < dim; i++ ) {
					sum += vv[ i ] * C[ offsetC + j * strideC1 + i * strideC2 ];
				}
				for ( i = 0; i < dim; i++ ) {
					C[ offsetC + j * strideC1 + i * strideC2 ] -= sum * tt[ i ];
				}
			}
			return;
		}
		// Fallback to general dlarf
		dlarf( 'right', M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	}
}


// EXPORTS //

export default dlarfx;
