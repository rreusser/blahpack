/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
