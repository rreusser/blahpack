/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {PositiveInteger} nb - block size used to construct T
* @param {Float64Array} V - pentagonal reflector matrix produced by `dtpqrt`
* @param {PositiveInteger} LDV - leading dimension of V
* @param {Float64Array} T - block triangular factor produced by `dtpqrt`
* @param {PositiveInteger} LDT - leading dimension of T (>= nb)
* @param {Float64Array} A - upper (left) or left (right) block of C, modified in-place
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - lower (left) or right (right) block of C, modified in-place
* @param {PositiveInteger} LDB - leading dimension of B (>= max(1,M))
* @param {Float64Array} WORK - workspace buffer (>= N*nb if `side='left'` or M*nb if `side='right'`)
* @param {integer} strideWORK - element stride for WORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth, fifth, sixth, seventh arguments must satisfy nonnegativity constraints
* @throws {RangeError} eighth argument (nb) must be a positive integer satisfying `nb <= K` when `K > 0`
* @throws {RangeError} seventh argument (l) must satisfy `0 <= L <= K`
* @throws {RangeError} tenth argument (LDV) must be >= max(1,M) (left) or max(1,N) (right)
* @throws {RangeError} twelfth argument (LDT) must be >= nb
* @throws {RangeError} fourteenth argument (LDA) must be >= max(1,K) (left) or max(1,M) (right)
* @throws {RangeError} sixteenth argument (LDB) must be >= max(1,M)
* @returns {integer} info status code (0 = success)
*/
function dtpmqrt( order, side, trans, M, N, K, l, nb, V, LDV, T, LDT, A, LDA, B, LDB, WORK, strideWORK ) {
	var ldvq;
	var ldaq;
	var sv1;
	var sv2;
	var st1;
	var st2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
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
		throw new RangeError( format( 'invalid argument. Seventh argument (l) must satisfy 0 <= L <= K. Value: `%d`.', l ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument (nb) must be a positive integer. Value: `%d`.', nb ) );
	}
	if ( K > 0 && nb > K ) {
		throw new RangeError( format( 'invalid argument. Eighth argument (nb) must satisfy 1 <= nb <= K. Value: `%d`.', nb ) );
	}

	// Effective leading-dimension lower bounds (matching the Fortran source).
	if ( side === 'left' ) {
		ldvq = max( 1, M );
		ldaq = max( 1, K );
	} else {
		ldvq = max( 1, N );
		ldaq = max( 1, M );
	}

	if ( order === 'column-major' && LDV < ldvq ) {
		throw new RangeError( format( 'invalid argument. Tenth argument (LDV) must be >= max(1,Q) where Q is M (side=left) or N (side=right). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && LDV < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument (LDV) must be >= max(1,K) for row-major. Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDT < nb ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument (LDT) must be >= nb. Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument (LDT) must be >= max(1,K) for row-major. Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDA < ldaq ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument (LDA) must be >= max(1,K) (side=left) or max(1,M) (side=right). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument (LDA) must be >= max(1,N) for row-major. Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument (LDB) must be >= max(1,M). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument (LDB) must be >= max(1,N) for row-major. Value: `%d`.', LDB ) );
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
		WORK = new Float64Array( 1 ); // TODO: set correct size
		strideWORK = 1;
	}
	return base( side, trans, M, N, K, l, nb, V, sv1, sv2, 0, T, st1, st2, 0, A, sa1, sa2, 0, B, sb1, sb2, 0, WORK, strideWORK, 0 );
}


// EXPORTS //

export default dtpmqrt;
