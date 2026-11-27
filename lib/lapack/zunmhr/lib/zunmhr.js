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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import ndarray from './ndarray.js';
import { computeOptimalWorkSize } from './base.js';


// VARIABLES //

const NBMAX = 64; // The callees' PARAMETER
const TSIZE = ( NBMAX + 1 ) * NBMAX; // The T part of the callees' WORK (LDT = NBMAX+1)


// MAIN //

/**
* Multiplies a general complex matrix by the unitary matrix Q (or its conjugate transpose) from a Hessenberg reduction.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {OperationSide} side - `'left'`: apply Q or Q**H from the Left; `'right'`: apply Q or Q**H from the Right.
* @param {('no-transpose'|'conjugate-transpose')} trans - `'no-transpose'`: apply Q (No transpose) `'conjugate-transpose'`: apply Q**H (Conjugate transpose)
* @param {NonNegativeInteger} M - the number of rows of the matrix C.
* @param {NonNegativeInteger} N - the number of columns of the matrix C.
* @param {integer} ilo - iLO and IHI must have the same values as in the previous call of ZGEHRD.
* @param {integer} ihi - iLO and IHI must have the same values as in the previous call of ZGEHRD.
* @param {Complex128Array} A - the vectors which define the elementary reflectors, as returned by ZGEHRD.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - tAU(i) must contain the scalar factor of the elementary reflector H(i), as returned by ZGEHRD.
* @param {integer} strideTAU - stride length for `TAU`
* @param {Complex128Array} C - on entry, the M-by-N matrix C. On exit, C is overwritten by Q*C or Q**H*C or C*Q**H or C*Q.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Complex128Array|null)} WORK - workspace of length at least `max(1,N)` if `side = 'left'` and `max(1,M)` if `side = 'right'` (`nw`, complex elements); the reference's optimum is `nw*NB`, and `nw*NB + TSIZE` elements (`NB = 32`, `TSIZE = 65*64 = 4160`, the zunmqr optimum) enable the full blocked path; if `null`, `nw*NB + TSIZE` elements are allocated
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, side === "left" ? M : N )`)
* @throws {RangeError} seventh argument is invalid (rejected when `ihi < min( ilo, side === "left" ? M : N ) || ihi > ( side === "left" ? M : N )`)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )`
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zunmhr( order, side, trans, M, N, ilo, ihi, A, LDA, TAU, strideTAU, C, LDC, WORK ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, side === "left" ? M : N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, side === 'left' ? M : N ) || ihi > ( side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `ihi < min( ilo, side === "left" ? M : N ) || ihi > ( side === "left" ? M : N )`). Value: `%d`.', ihi ) );
	}
	if ( LDA < max( 1, side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDA ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	const otau = stride2offset( ( side === 'left' ) ? M - 1 : N - 1, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's LWKOPT (nw*NB) predates the T block of zunmqr; allocate the callee's optimum nw*NB + TSIZE instead, which enables the full blocked path:
		WORK = new Complex128Array( computeOptimalWorkSize( side, trans, M, N, ilo, ihi ) + TSIZE );
	}
	return ndarray( side, trans, M, N, ilo, ihi, A, sa1, sa2, 0, TAU, strideTAU, otau, C, sc1, sc2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunmhr;
