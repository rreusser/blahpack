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
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real block reflector from an RZ factorization to a real M-by-N matrix C.
*
* Only `direct = 'backward'` and `storev = 'rowwise'` are supported.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('left'|'right'|'both')} side - `'left'` or `'right'`
* @param {TransposeOperation} trans - `'no-transpose'` or `'transpose'`
* @param {('backward')} direct - direction (`'backward'`)
* @param {('rowwise')} storev - storage direction (`'rowwise'`)
* @param {integer} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - order of the block reflector
* @param {NonNegativeInteger} l - number of columns of V
* @param {Float64Array} V - matrix of Householder vectors (K-by-L)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} T - triangular factor (K-by-K)
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} C - M-by-N matrix, overwritten on exit
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Float64Array|null)} WORK - workspace
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fourth argument must be one of the following: "backward"
* @throws {TypeError} fifth argument must be one of the following: "rowwise"
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be a nonnegative integer
* @throws {RangeError} thirteenth argument must be greater than or equal to max(1,K)
* @throws {RangeError} fifteenth argument must be greater than or equal to max(1,M)
* @returns {Float64Array} `C`
*/
function dlarzb( order, side, trans, direct, storev, M, N, K, l, V, LDV, T, LDT, C, LDC, WORK, LDWORK ) {
	let sv1, sv2, st1, st2, sc1, sc2, sw1, sw2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "backward". Value: `%s`.', direct ) );
	}
	if ( storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be one of the following: "rowwise". Value: `%s`.', storev ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( l < 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be a nonnegative integer. Value: `%d`.', l ) );
	}

	// T is K-by-K: LDT >= K regardless of order.
	if ( LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,K). Value: `%d`.', LDT ) );
	}

	// C is M-by-N.
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}

	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
		sc1 = 1;
		sc2 = LDC;
		sw1 = 1;
		sw2 = LDWORK;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
		sw1 = LDWORK;
		sw2 = 1;
	}
	// WORK is (N or M)-by-K; LDWORK*max(rows,cols) covers either layout.
	if ( WORK === null ) {
		WORK = new Float64Array( LDWORK * max( 1, max( K, ( side === 'left' ) ? N : M ) ) );
	}
	base( side, trans, direct, storev, M, N, K, l, V, sv1, sv2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, sw1, sw2, 0 );
	return C;
}


// EXPORTS //

export default dlarzb;
