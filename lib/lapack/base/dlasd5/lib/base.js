/* eslint-disable max-len */

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

import abs from '@stdlib/math/base/special/abs/lib/index.js';
import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';


// MAIN //

/**
* Computes the square root of the i-th eigenvalue of a positive symmetric rank-one modification of a 2-by-2 diagonal matrix.
*
* ## Notes
*
* -   Solves `diag(d)*diag(d) + rho*z*transpose(z)` for the i-th singular value.
* -   `d` must satisfy `0 <= d[0] < d[1]` and `rho > 0`.
* -   On exit, `DELTA[j]` contains `d[j] - sigma_i` and `WORK[j]` contains `d[j] + sigma_i`.
*
* @private
* @param {integer} i - eigenvalue index (1 or 2)
* @param {Float64Array} d - diagonal entries (length 2)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - updating vector components (length 2)
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} DELTA - output array for `d[j] - sigma_i` (length 2)
* @param {integer} strideDELTA - stride length for `DELTA`
* @param {NonNegativeInteger} offsetDELTA - starting index for `DELTA`
* @param {number} rho - scalar in the symmetric updating formula
* @param {Float64Array} dsigma - single-element output array; on exit, the computed sigma_i
* @param {Float64Array} WORK - output array for `d[j] + sigma_i` (length 2)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {void}
*/
function dlasd5( i, d, strideD, offsetD, z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var delsq;
	var del;
	var tau;
	var d1;
	var d2;
	var z1;
	var z2;
	var b;
	var c;
	var w;

	d1 = d[ offsetD ];
	d2 = d[ offsetD + strideD ];
	z1 = z[ offsetZ ];
	z2 = z[ offsetZ + strideZ ];

	del = d2 - d1;
	delsq = del * ( d2 + d1 );

	if ( i === 1 ) {
		w = 1.0 + ( 4.0 * rho * ( ( z2 * z2 / ( d1 + ( 3.0 * d2 ) ) ) - ( z1 * z1 / ( ( 3.0 * d1 ) + d2 ) ) ) / del );
		if ( w > 0.0 ) {
			b = delsq + ( rho * ( ( z1 * z1 ) + ( z2 * z2 ) ) );
			c = rho * z1 * z1 * delsq;

			// TAU is dsigma*dsigma - d(1)*d(1):
			tau = ( 2.0 * c ) / ( b + sqrt( abs( ( b * b ) - ( 4.0 * c ) ) ) );

			// TAU is dsigma - d(1):
			tau /= ( d1 + sqrt( ( d1 * d1 ) + tau ) );
			dsigma[ 0 ] = d1 + tau;
			DELTA[ offsetDELTA ] = -tau;
			DELTA[ offsetDELTA + strideDELTA ] = del - tau;
			WORK[ offsetWork ] = ( 2.0 * d1 ) + tau;
			WORK[ offsetWork + strideWork ] = ( d1 + tau ) + d2;
		} else {
			b = -delsq + ( rho * ( ( z1 * z1 ) + ( z2 * z2 ) ) );
			c = rho * z2 * z2 * delsq;

			// TAU is dsigma*dsigma - d(2)*d(2):
			if ( b > 0.0 ) {
				tau = ( -2.0 * c ) / ( b + sqrt( ( b * b ) + ( 4.0 * c ) ) );
			} else {
				tau = ( b - sqrt( ( b * b ) + ( 4.0 * c ) ) ) / 2.0;
			}

			// TAU is dsigma - d(2):
			tau /= ( d2 + sqrt( abs( ( d2 * d2 ) + tau ) ) );
			dsigma[ 0 ] = d2 + tau;
			DELTA[ offsetDELTA ] = -( del + tau );
			DELTA[ offsetDELTA + strideDELTA ] = -tau;
			WORK[ offsetWork ] = d1 + tau + d2;
			WORK[ offsetWork + strideWork ] = ( 2.0 * d2 ) + tau;
		}
	} else {
		// I = 2:
		b = -delsq + ( rho * ( ( z1 * z1 ) + ( z2 * z2 ) ) );
		c = rho * z2 * z2 * delsq;

		// TAU is dsigma*dsigma - d(2)*d(2):
		if ( b > 0.0 ) {
			tau = ( b + sqrt( ( b * b ) + ( 4.0 * c ) ) ) / 2.0;
		} else {
			tau = ( 2.0 * c ) / ( -b + sqrt( ( b * b ) + ( 4.0 * c ) ) );
		}

		// TAU is dsigma - d(2):
		tau /= ( d2 + sqrt( ( d2 * d2 ) + tau ) );
		dsigma[ 0 ] = d2 + tau;
		DELTA[ offsetDELTA ] = -( del + tau );
		DELTA[ offsetDELTA + strideDELTA ] = -tau;
		WORK[ offsetWork ] = d1 + tau + d2;
		WORK[ offsetWork + strideWork ] = ( 2.0 * d2 ) + tau;
	}
}


// EXPORTS //

export default dlasd5;
