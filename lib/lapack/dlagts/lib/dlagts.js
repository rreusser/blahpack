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
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the system of equations (T-λI)x = y.
*
* @param {integer} job - specifies the job to be performed by DLAGTS as follows: = 1: The equations (T - lambda*I)x = y are to be solved, but diagonal elements of U are not to be perturbed. = -1: The equations (T - lambda*I)x = y are to be solved and, if overflow would otherwise occur, the diagonal elements of U are to be perturbed.
* @param {NonNegativeInteger} N - the order of the matrix T.
* @param {Float64Array} a - on entry, A must contain the diagonal elements of U as returned from DLAGTF.
* @param {integer} strideA - stride length for `a`
* @param {Float64Array} b - on entry, B must contain the first super-diagonal elements of U as returned from DLAGTF.
* @param {integer} strideB - stride length for `b`
* @param {Float64Array} c - on entry, C must contain the sub-diagonal elements of L as returned from DLAGTF.
* @param {integer} strideC - stride length for `c`
* @param {Float64Array} d - on entry, D must contain the second super-diagonal elements of U as returned from DLAGTF.
* @param {integer} strideD - stride length for `d`
* @param {Int32Array} IN - on entry, IN must contain details of the matrix P as returned from DLAGTF (0-based).
* @param {integer} strideIN - stride length for `IN`
* @param {Float64Array} y - on entry, the right hand side vector y. On exit, Y is overwritten by the solution vector x.
* @param {integer} strideY - stride length for `y`
* @param {Float64Array} tol - input/output (length-1 array): with JOB < 0, TOL should be the minimum perturbation to be made to very small diagonal elements of U
* @throws {RangeError} first argument is invalid (rejected when `abs( job ) > 2 || job === 0`)
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dlagts( job, N, a, strideA, b, strideB, c, strideC, d, strideD, IN, strideIN, y, strideY, tol ) { // eslint-disable-line max-len, max-params

	if ( abs( job ) > 2 || job === 0 ) {
		throw new RangeError( format( 'invalid argument. First argument is invalid (rejected when `abs( job ) > 2 || job === 0`). Value: `%d`.', job ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const oa = stride2offset( N, strideA );
	const ob = stride2offset( N - 1, strideB );
	const oc = stride2offset( N - 1, strideC );
	const od = stride2offset( N - 2, strideD );
	const oin = stride2offset( N, strideIN );
	const oy = stride2offset( N, strideY );
	return base( job, N, a, strideA, oa, b, strideB, ob, c, strideC, oc, d, strideD, od, IN, strideIN, oin, y, strideY, oy, tol ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagts;
