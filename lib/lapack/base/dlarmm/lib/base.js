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

import dlamch from '../../dlamch/lib/index.js';

// VARIABLES //

var ONE = 1.0;
var HALF = 0.5;
var FOUR = 4.0;
var SMLNUM = dlamch( 'safe-minimum' ) / dlamch( 'precision' );
var BIGNUM = ( ONE / SMLNUM ) / FOUR;


// MAIN //

/**
* Returns a factor s in (0, 1] such that the linear updates.
*
*    (s _ C) - A _ (s _ B)  and  (s _ C) - (s _ A) _ B
*
* cannot overflow, where A, B, and C are matrices of conforming
* dimensions and ANORM, BNORM, CNORM are their infinity norms.
*
* @private
* @param {number} anorm - infinity norm of matrix A (must be >= 0)
* @param {number} bnorm - infinity norm of matrix B (must be >= 0)
* @param {number} cnorm - infinity norm of matrix C (must be >= 0)
* @returns {number} scaling factor in (0, 1]
*
* @example
* var s = dlarmm( 1.0, 1.0, 1.0 );
* // returns 1.0
*/
function dlarmm( anorm, bnorm, cnorm ) {
	if ( bnorm <= ONE ) {
		if ( anorm * bnorm > BIGNUM - cnorm ) {
			return HALF;
		}
	} else if ( anorm > ( BIGNUM - cnorm ) / bnorm ) {
		return HALF / bnorm;
	}
	return ONE;
}


// EXPORTS //

export default dlarmm;
