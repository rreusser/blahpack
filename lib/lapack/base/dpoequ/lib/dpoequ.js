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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes row and column scalings intended to equilibrate a symmetric positive definite matrix A and reduce its condition number (with respect to the two-norm).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - the N-by-N symmetric positive definite matrix whose scaling factors are to be computed.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} s - if INFO = 0, S contains the scale factors for A.
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} scond - output (length-1 array): if INFO = 0, S contains the ratio of the smallest S(i) to the largest S(i)
* @param {Float64Array} amax - output (length-1 array): absolute value of largest matrix element
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (0 = success)
*/
function dpoequ( order, N, A, LDA, s, strideS, scond, amax ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const os = stride2offset( N, strideS );
	return base( N, A, sa1, sa2, 0, s, strideS, os, scond, amax );
}


// EXPORTS //

export default dpoequ;
