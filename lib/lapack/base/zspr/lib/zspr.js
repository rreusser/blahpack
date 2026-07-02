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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the symmetric rank-1 update `A := alpha*x*x**T + A`.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {Complex128Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `AP`
*/
function zspr( uplo, N, alpha, x, strideX, AP, strideAP ) { // eslint-disable-line max-len, max-params
	var ox;

	ox = stride2offset( N, strideX );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, alpha, x, strideX, ox, AP, strideAP, 0 );
}


// EXPORTS //

export default zspr;
