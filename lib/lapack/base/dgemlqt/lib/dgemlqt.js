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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a real orthogonal matrix represented in the compact WY form returned by `dgelqt`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {integer} mb - block size used to build T
* @param {Float64Array} V - reflector vectors from `dgelqt`
* @param {PositiveInteger} LDV - leading dimension of V
* @param {Float64Array} T - block triangular factors from `dgelqt`
* @param {PositiveInteger} LDT - leading dimension of T
* @param {Float64Array} C - input/output matrix
* @param {PositiveInteger} LDC - leading dimension of C
* @param {(Float64Array|null)} WORK - workspace buffer of size at least `ldwork * mb`, where `ldwork = max(1,N)` for `side='left'` or `ldwork = max(1,M)` for `side='right'`; if `null` or omitted, an internal buffer of the required size is allocated as a LAPACKE-style convenience
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `mb < 1 || ( mb > K && K > 0 )`)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, K )` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )` (row-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `mb` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, K )` (row-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} fourth, fifth, and sixth arguments must be nonnegative integers
* @throws {RangeError} sixth argument (K) must satisfy K <= M when side='left' or K <= N when side='right'
* @returns {integer} info status code (0 = success)
*/
function dgemlqt( order, side, trans, M, N, K, mb, V, LDV, T, LDT, C, LDC, WORK ) {
	let ldwork, work, sv1, sv2, st1, st2, sc1, sc2;

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
	if ( mb < 1 || ( mb > K && K > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `mb < 1 || ( mb > K && K > 0 )`). Value: `%d`.', mb ) );
	}
	if ( order === 'column-major' && ( LDV < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', K, LDV ) );
	}
	if ( order === 'row-major' && ( LDV < max( 1, side === 'left' ? M : N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDV ) );
	}
	if ( order === 'column-major' && ( LDT < mb ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to %d. Value: `%d`.', mb, LDT ) );
	}
	if ( order === 'row-major' && ( LDT < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', K, LDT ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	const Q = ( side === 'left' ) ? M : N;
	if ( side === 'left' ) {
		if ( K > Q ) {
			throw new RangeError( format( 'invalid argument. Sixth argument (K) must satisfy K <= M when side=\'left\'. Value: `%d`.', K ) );
		}
	} else if ( K > Q ) {
		throw new RangeError( format( 'invalid argument. Sixth argument (K) must satisfy K <= N when side=\'right\'. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}

	// Allocate WORK as a LAPACKE-style convenience when caller omits it.
	if ( WORK === void 0 || WORK === null ) {
		ldwork = ( side === 'left' ) ? max( 1, N ) : max( 1, M );
		work = new Float64Array( ldwork * mb );
	} else {
		work = WORK;
	}
	return base( side, trans, M, N, K, mb, V, sv1, sv2, 0, T, st1, st2, 0, C, sc1, sc2, 0, work, 1, 0 );
}


// EXPORTS //

export default dgemlqt;
