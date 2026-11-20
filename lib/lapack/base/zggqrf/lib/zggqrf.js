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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} p - p
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAUA - TAUA
* @param {integer} strideTAUA - strideTAUA
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} TAUB - TAUB
* @param {integer} strideTAUB - strideTAUB
* @param {(Complex128Array|null)} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, p )` (row-major)
* @returns {integer} info status code
*/
function zggqrf( order, N, M, p, A, LDA, TAUA, strideTAUA, B, LDB, TAUB, strideTAUB, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, p ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', p, LDB ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const otaua = stride2offset( N, strideTAUA );
	const otaub = stride2offset( N, strideTAUB );
	if ( WORK === null || WORK === void 0 ) {
		// Blocked minimum for the three sub-kernels (NB=32); see lib/ndarray.js.
		WORK = new Complex128Array( Math.max( 1, N, M, p,
			( Math.min( N, M ) > 32 ) ? ( ( M * 32 ) + ( 32 * 32 ) ) : M,
			( Math.min( N, M ) > 32 ) ? ( ( p * 32 ) + ( 33 * 32 ) ) : p,
			( Math.min( N, p ) > 32 ) ? ( ( N * 32 ) + ( 32 * 32 ) ) : N
		) );
	}
	return base( N, M, p, A, sa1, sa2, 0, TAUA, strideTAUA, otaua, B, sb1, sb2, 0, TAUB, strideTAUB, otaub, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggqrf;
