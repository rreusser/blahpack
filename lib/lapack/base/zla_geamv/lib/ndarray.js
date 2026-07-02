/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant) using a general complex matrix to calculate error bounds.
*
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {number} alpha - scalar constant
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output real vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} tenth argument must be non-zero
* @throws {RangeError} fourteenth argument must be non-zero
* @returns {Float64Array} `y`
*/
function zla_geamv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	return base( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY );
}


// EXPORTS //

export default zla_geamv;
