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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a complex symmetric matrix stored
* in Rectangular Full Packed (RFP) format.
*
* @param {('one-norm'|'max'|'inf-norm'|'frobenius')} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {('no-transpose'|'conjugate-transpose')} transr - specifies the storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {integer} N - order of the matrix
* @param {Complex128Array} A - input array in RFP format
* @param {integer} strideA - stride length for `A`
* @param {(Float64Array|null)} WORK - workspace array, length >= N
* @throws {TypeError} first argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius"
* @throws {TypeError} second argument must be one of the following: "no-transpose", "conjugate-transpose"
* @throws {TypeError} third argument must be a valid matrix triangle
* @returns {number} norm value
*/
function zlansf( norm, transr, uplo, N, A, strideA, WORK ) {
	if ( norm !== 'one-norm' && norm !== 'max' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius". Value: `%s`.', norm ) );
	}
	if ( transr !== 'no-transpose' && transr !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-transpose", "conjugate-transpose". Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	const oa = stride2offset( ( N * ( N + 1 ) ) / 2, strideA );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// WORK has length N (referenced only for one-/inf-norms).
	if ( WORK === null ) {
		WORK = new Float64Array( max( 1, N ) );
	}
	return base( norm, transr, uplo, N, A, strideA, oa, WORK, 1, 0 );
}


// EXPORTS //

export default zlansf;
