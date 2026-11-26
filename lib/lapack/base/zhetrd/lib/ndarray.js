/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
 * by a unitary similarity transformation: `Q__H*A*Q = T`.
 *
 * Uses the blocked algorithm: reduces NB columns at a time using zlatrd
 * (panel factorization) and zher2k (trailing matrix update), then finishes
 * the remaining block with zhetd2 (unblocked).
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
 * @param {integer} strideA1 - stride of first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Float64Array} d - output diagonal elements of T (length N)
 * @param {integer} strideD - stride for d
 * @param {NonNegativeInteger} offsetD - starting index for d
 * @param {Float64Array} e - output off-diagonal elements of T (length N-1)
 * @param {integer} strideE - stride for e
 * @param {NonNegativeInteger} offsetE - starting index for e
 * @param {Complex128Array} TAU - output scalar factors of reflectors (length N-1)
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} d - output diagonal elements of T (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAU - output scalar factors of reflectors (length N-1)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace; length >= 1 (N*NB, with NB from `ilaenv`, enables the full blocked algorithm)
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info (0 = success)
*/
function zhetrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( WORK.length < offsetWork + 1 ) {
		throw new RangeError( format( 'invalid argument. `WORK` must have at least 1 element starting at offset %d. Length: `%d`.', offsetWork, WORK.length ) );
	}
	return base(uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zhetrd;
