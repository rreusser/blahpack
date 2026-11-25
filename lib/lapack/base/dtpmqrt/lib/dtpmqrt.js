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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {OperationSide} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {integer} nb - block size used to construct T
* @param {Float64Array} V - pentagonal reflector matrix produced by `dtpqrt`
* @param {PositiveInteger} LDV - leading dimension of V
* @param {Float64Array} T - block triangular factor produced by `dtpqrt`
* @param {PositiveInteger} LDT - leading dimension of T (>= nb)
* @param {Float64Array} A - upper (left) or left (right) block of C, modified in-place
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - lower (left) or right (right) block of C, modified in-place
* @param {PositiveInteger} LDB - leading dimension of B (>= max(1,M))
* @param {(Float64Array|null)} WORK - workspace buffer (>= N*nb if `side='left'` or M*nb if `side='right'`)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `l < 0 || l > K`)
* @throws {RangeError} eighth argument is invalid (rejected when `nb < 1 || ( nb > K && K > 0 )`)
* @throws {RangeError} twelfth argument must be greater than or equal to `nb` (column-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, K )` (row-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} fourth, fifth, sixth, seventh arguments must satisfy nonnegativity constraints
* @throws {RangeError} tenth argument (LDV) must be >= max(1,M) (left) or max(1,N) (right)
* @throws {RangeError} fourteenth argument (LDA) must be >= max(1,K) (left) or max(1,M) (right)
* @returns {integer} info status code (0 = success)
*/
function dtpmqrt( order, side, trans, M, N, K, l, nb, V, LDV, T, LDT, A, LDA, B, LDB, WORK ) {
	let sv1, sv2, st1, st2, sa1, sa2, sb1, sb2;

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
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( l < 0 || l > K ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `l < 0 || l > K`). Value: `%d`.', l ) );
	}
	if ( nb < 1 || ( nb > K && K > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `nb < 1 || ( nb > K && K > 0 )`). Value: `%d`.', nb ) );
	}
	if ( order === 'column-major' && ( LDT < nb ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to %d. Value: `%d`.', nb, LDT ) );
	}
	if ( order === 'row-major' && ( LDT < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', K, LDT ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}


	if ( order === 'column-major' && ( LDV < ( ( side === 'left' ) ? max( 1, M ) : max( 1, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (column-major: rejected when `LDV.LT.LDVQ`). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && ( LDV < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (row-major: must also cover the K columns). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && ( LDA < ( ( side === 'left' ) ? max( 1, K ) : max( 1, M ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDA.LT.LDAQ`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, ( side === 'left' ) ? N : K ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (row-major: must also cover the ( side === "left" ) ? N : K columns). Value: `%d`.', LDA ) );
	}

	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( max( 1, ( ( side === 'left' ) ? N : M ) * nb ) ); // Fortran: N*NB if SIDE = 'L', M*NB if SIDE = 'R'
	} else if ( M > 0 && N > 0 && K > 0 ) {
		// Assert a caller-provided workspace is large enough so an under-sized
		// buffer is a loud RangeError rather than a silent NaN. WORK is
		// logically nb-by-N (`nb*N`) for side='left' or M-by-nb (`M*nb`) for
		// side='right'.
		const need = ( side === 'left' ) ? ( nb * N ) : ( M * nb );
		if ( WORK.length < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements. Provided length: %d.', need, WORK.length ) );
		}
	}
	return base( side, trans, M, N, K, l, nb, V, sv1, sv2, 0, T, st1, st2, 0, A, sa1, sa2, 0, B, sb1, sb2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dtpmqrt;
