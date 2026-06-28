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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the square root of the i-th eigenvalue of a positive symmetric rank-one modification of a 2-by-2 diagonal matrix.
*
* @param {integer} i - eigenvalue index (1 or 2)
* @param {Float64Array} D - diagonal entries (length 2)
* @param {integer} strideD - stride length for `D`
* @param {Float64Array} Z - updating vector components (length 2)
* @param {integer} strideZ - stride length for `Z`
* @param {Float64Array} DELTA - output array for `D[j] - sigma_i` (length 2)
* @param {integer} strideDELTA - stride length for `DELTA`
* @param {number} rho - scalar in the symmetric updating formula
* @param {Float64Array} dsigma - single-element output array; on exit, the computed sigma_i
* @param {Float64Array} WORK - output array for `D[j] + sigma_i` (length 2)
* @param {integer} strideWork - stride length for `WORK`
* @returns {void}
*/
function dlasd5( i, D, strideD, Z, strideZ, DELTA, strideDELTA, rho, dsigma, WORK, strideWork ) {
	var offsetDELTA = stride2offset( 2, strideDELTA );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	var offsetWork = stride2offset( 2, strideWork );
	var offsetD = stride2offset( 2, strideD );
	var offsetZ = stride2offset( 2, strideZ );
	return base( i, D, strideD, offsetD, Z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dlasd5;
