/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Generates a complex unitary matrix Q which is defined as the product of.
* N-1 elementary reflectors of order N, as returned by ZHPTRD using
* packed storage.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangle was used in ZHPTRD ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Complex128Array} AP - packed reflector vectors from ZHPTRD
* @param {Complex128Array} TAU - scalar factors of the reflectors from ZHPTRD (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {Complex128Array} Q - output unitary matrix (N x N)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {(Complex128Array|null)} WORK - workspace array (length >= N-1)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (0 = success)
*/
function zupgtr( order, uplo, N, AP, TAU, strideTAU, Q, LDQ, WORK ) {
	let sq1, sq2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDQ ) );
	}
	const otau = stride2offset( N - 1, strideTAU );
	if ( order === 'column-major' ) {
		sq1 = 1;
		sq2 = LDQ;
	} else {
		sq1 = LDQ;
		sq2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N - 1 );
		WORK = new Complex128Array( minWork );
	}
	return strided( uplo, N, AP, 1, 0, TAU, strideTAU, otau, Q, sq1, sq2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zupgtr;
