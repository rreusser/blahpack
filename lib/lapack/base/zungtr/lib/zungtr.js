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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Generates a complex unitary matrix Q which is defined as the product of n-1 elementary reflectors of order N, as returned by ZHETRD: if UPLO = 'U', Q = H(n-1).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - `'upper'`: Upper triangle of A contains elementary reflectors from ZHETRD; `'lower'`: Lower triangle of A contains elementary reflectors from ZHETRD.
* @param {NonNegativeInteger} N - the order of the matrix Q.
* @param {Complex128Array} A - on entry, the vectors which define the elementary reflectors, as returned by ZHETRD. On exit, the N-by-N unitary matrix Q.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - tAU(i) must contain the scalar factor of the elementary reflector H(i), as returned by ZHETRD.
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Complex128Array|null)} WORK - workspace of length at least `max(1,N-1)` (complex elements); for optimum performance it should hold `(N-1)*NB` elements (`NB = 32`, the zungql/zungqr block size), which enables the blocked path; if `null`, a workspace of the optimal size is allocated
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zungtr( order, uplo, N, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const otau = stride2offset( N - 1, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's LWKOPT, the zungql/zungqr optimum:
		WORK = new Complex128Array( computeOptimalWorkSize( uplo, N ) );
	}
	return base( uplo, N, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default zungtr;
