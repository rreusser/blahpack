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
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a complex unitary matrix represented in the compact WY form returned by `zgeqrt`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {PositiveInteger} nb - block size used to build T
* @param {Complex128Array} V - reflector vectors from `zgeqrt`
* @param {PositiveInteger} LDV - leading dimension of V
* @param {Complex128Array} T - block triangular factors from `zgeqrt`
* @param {PositiveInteger} LDT - leading dimension of T (>= nb)
* @param {Complex128Array} C - input/output matrix
* @param {PositiveInteger} LDC - leading dimension of C
* @param {Complex128Array} WORK - workspace buffer
* @param {integer} strideWORK - element stride for WORK (complex elements)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth, fifth, and sixth arguments must be nonnegative integers
* @throws {RangeError} ninth argument (LDV) must be `>= max(1,Q)` where Q is M (side='left') or N (side='right')
* @throws {RangeError} eleventh argument (LDT) must be `>= nb`
* @throws {RangeError} thirteenth argument (LDC) must be `>= max(1,M)` (column-major) or `max(1,N)` (row-major)
* @returns {integer} info status code (0 = success)
*/
function zgemqrt( order, side, trans, M, N, K, nb, V, LDV, T, LDT, C, LDC, WORK, strideWORK ) {
	var sv1;
	var sv2;
	var st1;
	var st2;
	var sc1;
	var sc2;
	var Q;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( trans === 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be `no-transpose` or `conjugate-transpose` for a unitary operator. Value: `%s`.', trans ) );
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
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a positive integer. Value: `%d`.', nb ) );
	}
	if ( K > 0 && nb > K ) {
		throw new RangeError( format( 'invalid argument. Seventh argument (nb) must satisfy 1 <= nb <= K. Value: `%d`.', nb ) );
	}
	Q = ( side === 'left' ) ? M : N;
	if ( side === 'left' ) {
		if ( K > Q ) {
			throw new RangeError( format( 'invalid argument. Sixth argument (K) must satisfy K <= M when side=\'left\'. Value: `%d`.', K ) );
		}
	} else if ( K > Q ) {
		throw new RangeError( format( 'invalid argument. Sixth argument (K) must satisfy K <= N when side=\'right\'. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && LDV < max( 1, Q ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument (LDV) must be greater than or equal to max(1,Q). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && LDV < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument (LDV) must be greater than or equal to max(1,K). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDT < nb ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument (LDT) must be greater than or equal to nb. Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument (LDT) must be greater than or equal to max(1,K). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument (LDC) must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument (LDC) must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
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
	return base( side, trans, M, N, K, nb, V, sv1, sv2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, strideWORK, 0 );
}


// EXPORTS //

export default zgemqrt;
