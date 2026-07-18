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
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square real matrix using reverse communication.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} v - workspace array of length N
* @param {integer} strideV - `v` stride length
* @param {Float64Array} x - input/output vector of length N
* @param {integer} strideX - `x` stride length
* @param {Int32Array} ISGN - sign array of length N
* @param {integer} strideISGN - `ISGN` stride length
* @param {Float64Array} EST - in/out: EST[0] is the estimated norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlacon( N, v, strideV, x, strideX, ISGN, strideISGN, EST, KASE ) {
	const ov = stride2offset( N, strideV );
	const ox = stride2offset( N, strideX );
	const oi = stride2offset( N, strideISGN );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, v, strideV, ov, x, strideX, ox, ISGN, strideISGN, oi, EST, KASE );
}


// EXPORTS //

export default dlacon;
