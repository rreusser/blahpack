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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a symmetric matrix A in packed storage using the scaling factors in the vector S.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride length for `S`
* @param {NonNegativeInteger} offsetS - starting index for `S`
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - 'none' or 'yes'
*/
function dlaqsp( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, scond, amax ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, scond, amax ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqsp;
