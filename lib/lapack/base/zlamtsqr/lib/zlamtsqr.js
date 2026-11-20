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
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is the complex unitary matrix from a Tall-Skinny QR factorization (`zlatsqr`).
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {integer} mb - row block size used by `zlatsqr` (must equal the value used to factor)
* @param {integer} nb - inner block size used by the compact-WY representation
* @param {Complex128Array} A - reflector vectors from `zlatsqr`
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} T - block triangular factors from `zlatsqr`
* @param {PositiveInteger} LDT - leading dimension of T
* @param {Complex128Array} C - input/output matrix
* @param {PositiveInteger} LDC - leading dimension of C
* @param {(Complex128Array|null)} WORK - workspace buffer (length `>= max(1, N)*nb` when `side='left'`, `>= max(1, M)*nb` when `side='right'`, in complex elements); `null` requests internal allocation
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} fourth argument is invalid (rejected when `M < K`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument is invalid (rejected when `K < nb || nb < 1`)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, K )` (row-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, nb )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} dimensions and leading dimensions must satisfy the documented bounds
* @returns {integer} info status code (0 = success)
*/
function zlamtsqr( order, side, trans, M, N, K, mb, nb, A, LDA, T, LDT, C, LDC, WORK ) {
	let sa1, sa2, st1, st2, sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( M < K ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `M < K`). Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( K < nb || nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `K < nb || nb < 1`). Value: `%d`.', nb ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, side === 'left' ? M : N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', K, LDA ) );
	}
	if ( order === 'column-major' && ( LDT < max( 1, nb ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', nb, LDT ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	const Q = ( side === 'left' ) ? M : N;
	if ( K > Q ) {
		throw new RangeError( format( 'invalid argument. Sixth argument (K) must satisfy K <= %s when side=\'%s\'. Value: `%d`.', ( side === 'left' ) ? 'M' : 'N', side, K ) );
	}
	if ( order === 'row-major' && LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument (LDT) must be greater than or equal to max(1,K). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( ( side === 'left' ) ? max( 1, N ) * nb : max( 1, M ) * nb );
	}
	return base( side, trans, M, N, K, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlamtsqr;
