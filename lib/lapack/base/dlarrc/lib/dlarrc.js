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
* Counts the number of eigenvalues of a symmetric tridiagonal matrix in an interval.
*
* @param {('tridiagonal'|'ldl')} jobt - specifies the matrix type: `'tridiagonal'` for matrix T, `'ldl'` for matrix `L * D * L^T`
* @param {NonNegativeInteger} N - order of the matrix
* @param {number} vl - lower bound for the eigenvalues
* @param {number} vu - upper bound for the eigenvalues
* @param {Float64Array} D - diagonal elements (length N)
* @param {integer} strideD - stride length for `D`
* @param {Float64Array} E - off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `E`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {Int32Array} eigcnt - output (length-1 array): the number of eigenvalues of the symmetric tridiagonal matrix T that are in the interval (VL,VU]
* @param {Int32Array} lcnt - output (length-1 array): `lcnt`
* @param {Int32Array} rcnt - output (length-1 array): the left and right negcounts of the interval
* @throws {TypeError} first argument must be one of the following: "tridiagonal", "ldl"
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function dlarrc( jobt, N, vl, vu, D, strideD, E, strideE, pivmin, eigcnt, lcnt, rcnt ) {
	if ( jobt !== 'tridiagonal' && jobt !== 'ldl' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "tridiagonal", "ldl". Value: `%s`.', jobt ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobt, N, vl, vu, D, strideD, od, E, strideE, oe, pivmin, eigcnt, lcnt, rcnt );
}


// EXPORTS //

export default dlarrc;
