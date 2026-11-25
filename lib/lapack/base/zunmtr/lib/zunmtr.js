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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a general complex matrix by the unitary matrix Q (or its conjugate transpose) from a Hermitian tridiagonal reduction.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {OperationSide} side - `'left'`: apply Q or Q**H from the Left; `'right'`: apply Q or Q**H from the Right.
* @param {MatrixTriangle} uplo - `'upper'`: Upper triangle of A contains elementary reflectors from ZHETRD; `'lower'`: Lower triangle of A contains elementary reflectors from ZHETRD.
* @param {('no-transpose'|'conjugate-transpose')} trans - `'no-transpose'`: No transpose, apply Q; `'conjugate-transpose'`: Conjugate transpose, apply Q**H.
* @param {NonNegativeInteger} M - the number of rows of the matrix C.
* @param {NonNegativeInteger} N - the number of columns of the matrix C.
* @param {Complex128Array} A - the vectors which define the elementary reflectors, as returned by ZHETRD.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - tAU(i) must contain the scalar factor of the elementary reflector H(i), as returned by ZHETRD.
* @param {integer} strideTAU - stride length for `TAU`
* @param {Complex128Array} C - on entry, the M-by-N matrix C. On exit, C is overwritten by Q*C or Q**H*C or C*Q**H or C*Q.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `side === 'left' ? max( 1, N ) : max( 1, M )` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {TypeError} fourth argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )`
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zunmtr( order, side, uplo, trans, M, N, A, LDA, TAU, strideTAU, C, LDC, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDA ) );
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
	const otau = stride2offset( ( ( side === 'left' ) ? M : N ) - 1, strideTAU ); // TAU has M-1 (left) or N-1 (right) entries
	if ( WORK === null || WORK === void 0 ) {
		// The (NQ-1) reflectors go to the blocked ?ormql/?ormqr (NB=32), which use
		// `nw` elements unblocked and `nw*NB + (NB+1)*NB` once NQ-1 > NB, where
		// nw = N (side='left') or M (side='right'), as in LWORK's NW*NB + TSIZE.
		const nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
		const nq = ( side === 'left' ) ? M : N;
		const minWork = ( ( nq - 1 ) > 32 ) ? ( ( nw * 32 ) + ( 33 * 32 ) ) : nw;
		WORK = new Complex128Array( minWork );
	}
	return base( side, uplo, trans, M, N, A, sa1, sa2, 0, TAU, strideTAU, otau, C, sc1, sc2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunmtr;
