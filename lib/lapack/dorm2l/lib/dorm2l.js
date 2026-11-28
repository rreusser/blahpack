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
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Multiplies a general matrix by the orthogonal matrix from a QL factorization determined by sgeqlf (unblocked algorithm).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {OperationSide} side - `'left'`: apply Q or Q**T from the Left `'right'`: apply Q or Q**T from the Right.
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'`: apply Q (No transpose) `'transpose'`: apply Q**T (Transpose)
* @param {NonNegativeInteger} M - the number of rows of the matrix C.
* @param {NonNegativeInteger} N - the number of columns of the matrix C.
* @param {NonNegativeInteger} K - the number of elementary reflectors whose product defines the matrix Q.
* @param {Float64Array} A - the i-th column must contain the vector which defines the elementary reflector H(i), for i = 1,2,...,k, as returned by DGEQLF in the last k columns of its array argument A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - tAU(i) must contain the scalar factor of the elementary reflector H(i), as returned by DGEQLF.
* @param {integer} strideTAU - stride length for `TAU`
* @param {Float64Array} C - on entry, the m by n matrix C. On exit, C is overwritten by Q*C or Q**T*C or C*Q**T or C*Q.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `K < 0 || K > ( side === "left" ? M : N )`)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, K )` (row-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dorm2l( order, side, trans, M, N, K, A, LDA, TAU, strideTAU, C, LDC, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 || K > ( side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `K < 0 || K > ( side === "left" ? M : N )`). Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, side === 'left' ? M : N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', K, LDA ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	const otau = stride2offset( K, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( max( 1, ( side === 'left' ) ? N : M ) ); // Fortran: WORK(N) if SIDE = 'L', WORK(M) if SIDE = 'R'
	}
	return strided( side, trans, M, N, K, A, sa1, sa2, 0, TAU, strideTAU, otau, C, sc1, sc2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorm2l;
