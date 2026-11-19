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
* @license Apache-2.0
*
* @param {integer} job - job
* @param {NonNegativeInteger} N - N
* @param {Float64Array} a - a
* @param {integer} strideA - strideA
* @param {Float64Array} b - b
* @param {integer} strideB - strideB
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Int32Array} IN - IN
* @param {integer} strideIN - strideIN
* @param {Float64Array} y - y
* @param {integer} strideY - strideY
* @param {Float64Array} tol - input/output (length-1 array): with JOB < 0, TOL should be the minimum perturbation to be made to very small diagonal elements of U
* @throws {RangeError} if a numerical argument does not satisfy constraints
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
	const ob = stride2offset( N, strideB );
	const oc = stride2offset( N, strideC );
	const od = stride2offset( N, strideD );
	const oin = stride2offset( N, strideIN );
	const oy = stride2offset( N, strideY );
	return base( job, N, a, strideA, oa, b, strideB, ob, c, strideC, oc, d, strideD, od, IN, strideIN, oin, y, strideY, oy, tol ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagts;
