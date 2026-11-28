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
* Computes an LU factorization of a matrix T-λI.
*
* @param {NonNegativeInteger} N - the order of the matrix T.
* @param {Float64Array} a - on entry, A must contain the diagonal elements of T. On exit, A is overwritten by the n diagonal elements of the upper triangular matrix U of the factorization of T.
* @param {integer} strideA - stride length for `a`
* @param {number} lambda - on entry, the scalar lambda.
* @param {Float64Array} b - on entry, B must contain the (n-1) super-diagonal elements of T. On exit, B is overwritten by the (n-1) super-diagonal elements of the matrix U of the factorization of T.
* @param {integer} strideB - stride length for `b`
* @param {Float64Array} c - on entry, C must contain the (n-1) sub-diagonal elements of T. On exit, C is overwritten by the (n-1) sub-diagonal elements of the matrix L of the factorization of T.
* @param {integer} strideC - stride length for `c`
* @param {number} tol - on entry, a relative tolerance used to indicate whether or not the matrix (T - lambda*I) is nearly singular.
* @param {Float64Array} d - on exit, D is overwritten by the (n-2) second super-diagonal elements of the matrix U of the factorization of T.
* @param {integer} strideD - stride length for `d`
* @param {Int32Array} IN - on exit, IN contains details of the permutation matrix P (0-based).
* @param {integer} strideIN - stride length for `IN`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info status code
*/
function dlagtf( N, a, strideA, lambda, b, strideB, c, strideC, tol, d, strideD, IN, strideIN ) { // eslint-disable-line max-len, max-params

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const oa = stride2offset( N, strideA );
	const ob = stride2offset( N - 1, strideB );
	const oc = stride2offset( N - 1, strideC );
	const od = stride2offset( N - 2, strideD );
	const oin = stride2offset( N, strideIN );
	return base( N, a, strideA, oa, lambda, b, strideB, ob, c, strideC, oc, tol, d, strideD, od, IN, strideIN, oin ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagtf;
