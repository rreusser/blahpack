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

// MODULES //

import dscal from './../../../../blas/base/dscal/lib/base.js';


// VARIABLES //

// Safe minimum: smallest normalized double-precision number
var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Scales a vector by the reciprocal of a scalar, performing the scaling.
* carefully to avoid overflow/underflow.
*
* Computes x <- x / sa by iteratively multiplying by safe scale factors.
*
* @private
* @param {NonNegativeInteger} N - number of elements
* @param {number} sa - scalar divisor
* @param {Float64Array} x - input/output array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @returns {Float64Array} input array
*/
function drscl( N, sa, x, strideX, offsetX ) {
	var cden1;
	var cnum1;
	var cden;
	var cnum;
	var done;
	var mul;

	if ( N <= 0 ) {
		return x;
	}

	// Initialize: we want to compute x = x * (1/sa)
	cden = sa;
	cnum = 1.0;

	while ( true ) {
		cden1 = cden * SMLNUM;
		cnum1 = cnum / BIGNUM;
		if ( Math.abs( cden1 ) > Math.abs( cnum ) && cnum !== 0.0 ) {
			// Pre-multiply x by SMLNUM if CDEN is large compared to CNUM
			mul = SMLNUM;
			done = false;
			cden = cden1;
		} else if ( Math.abs( cnum1 ) > Math.abs( cden ) ) {
			// Pre-multiply x by BIGNUM if CNUM is large compared to CDEN
			mul = BIGNUM;
			done = false;
			cnum = cnum1;
		} else {
			// Multiply x by CNUM / CDEN
			mul = cnum / cden;
			done = true;
		}
		dscal( N, mul, x, strideX, offsetX );
		if ( done ) {
			break;
		}
	}
	return x;
}


// EXPORTS //

export default drscl;
