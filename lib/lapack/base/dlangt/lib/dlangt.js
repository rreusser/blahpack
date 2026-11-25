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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the 1-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a general tridiagonal matrix.
*
* @param {('one-norm'|'max'|'inf-norm'|'frobenius')} norm - specifies the value to be returned in DLANGT as described above.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} DL - the (n-1) sub-diagonal elements of A.
* @param {integer} strideDL - stride length for `DL`
* @param {Float64Array} d - the diagonal elements of A.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} DU - the (n-1) super-diagonal elements of A.
* @param {integer} strideDU - stride length for `DU`
* @throws {TypeError} first argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius"
* @throws {TypeError} if a string argument is not a valid option
* @returns {number} the computed norm
*/
function dlangt( norm, N, DL, strideDL, d, strideD, DU, strideDU ) { // eslint-disable-line max-len, max-params

	if ( norm !== 'one-norm' && norm !== 'max' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius". Value: `%s`.', norm ) );
	}
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu );
}


// EXPORTS //

export default dlangt;
