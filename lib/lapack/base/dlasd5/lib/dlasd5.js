/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
* @returns {void}
*/
function dlasd5( i, D, strideD, Z, strideZ, DELTA, strideDELTA, rho, dsigma, WORK ) {
	const offsetDELTA = stride2offset( 2, strideDELTA );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 );
		WORK = new Float64Array( minWork );
	}
	const offsetD = stride2offset( 2, strideD );
	const offsetZ = stride2offset( 2, strideZ );
	return base( i, D, strideD, offsetD, Z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, 1, 0 );
}


// EXPORTS //

export default dlasd5;
