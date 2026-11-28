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
* Computes the norm of a complex Hermitian tridiagonal matrix A.
*
* @param {('one-norm'|'max'|'inf-norm'|'frobenius')} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} d - diagonal elements (real), length N
* @param {integer} strideD - `d` stride length
* @param {Complex128Array} e - off-diagonal elements (complex), length N-1
* @param {integer} strideE - `e` stride length (in complex elements)
* @throws {TypeError} first argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius"
* @throws {TypeError} if a string argument is not a valid option
* @returns {number} the computed norm value
*/
function zlanht( norm, N, d, strideD, e, strideE ) {
	if ( norm !== 'one-norm' && norm !== 'max' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius". Value: `%s`.', norm ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, N, d, strideD, od, e, strideE, oe );
}


// EXPORTS //

export default zlanht;
