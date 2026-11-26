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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// VARIABLES //

const FACTOPTNB = 32; // max of the ZGEQRF and ZGELQF block sizes (`ilaenv`), as in IPARAM2STAGE


// MAIN //

/**
* Reduces a complex Hermitian matrix `A` to complex Hermitian band-diagonal form `AB` by a unitary similarity transformation.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals of the reduced band matrix
* @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} AB - output band-diagonal matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Complex128Array} TAU - output array of reflector scalar factors
* @param {integer} strideTAU - stride for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - workspace; length from `offsetWork` at least the reference's minimum (and optimum) `max(1, N*kd + N*max(kd,32) + 2*kd*kd)` complex elements when `N > 0`, including when `N <= kd+1`
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} WORK must be sufficiently large
* @returns {integer} status code (0 = success)
*/
function zhetrd_he2hb( uplo, N, kd, A, strideA1, strideA2, offsetA, AB, strideAB1, strideAB2, offsetAB, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let need;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	// Caller owns the workspace. The reference's minimum is `LWMIN = max(1, N*kd + N*max(kd,FACTOPTNB) + 2*kd*kd)` (ILAENV2STAGE, with `FACTOPTNB = 32`, the ZGEQRF/ZGELQF block size), checked before its `N <= kd+1` quick return, so it is demanded there too; `N = 0` needs none (base.js returns before touching WORK).
	if ( N > 0 ) {
		need = max( 1, ( N*kd ) + ( N * max( kd, FACTOPTNB ) ) + ( 2*kd*kd ) );
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( uplo, N, kd, A, strideA1, strideA2, offsetA, AB, strideAB1, strideAB2, offsetAB, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zhetrd_he2hb;
