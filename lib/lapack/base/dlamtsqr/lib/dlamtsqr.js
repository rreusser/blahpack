/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Overwrites a real `M`-by-`N` matrix `C` with `op(Q)*C` or `C*op(Q)`, where `Q` is a real orthogonal matrix produced by a blocked Tall-Skinny QR (TSQR) factorization (`dlatsqr`).
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {PositiveInteger} mb - row block size used in the TSQR factorization
* @param {PositiveInteger} nb - column block size of the compact-WY representation
* @param {Float64Array} A - reflector vectors from `dlatsqr`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - block triangular factors from `dlatsqr`
* @param {PositiveInteger} LDT - leading dimension of `T` (>= `nb`)
* @param {Float64Array} C - input/output matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth, fifth, sixth arguments must be nonnegative integers
* @throws {RangeError} seventh and eighth arguments must be positive integers
* @throws {RangeError} `nb` must satisfy `1 <= nb <= K` when `K > 0`
* @throws {RangeError} `K` must satisfy `K <= M` when `side='left'` or `K <= N` when `side='right'`
* @throws {RangeError} `LDA` must be valid for the chosen `order` and `side`
* @throws {RangeError} `LDT` must be `>= nb` (column-major) or `>= K` (row-major)
* @throws {RangeError} `LDC` must be `>= max(1,M)` (column-major) or `>= max(1,N)` (row-major)
* @returns {integer} status code (0 = success)
*/
function dlamtsqr( order, side, trans, M, N, K, mb, nb, A, LDA, T, LDT, C, LDC, WORK, strideWork ) {
	var sa1;
	var sa2;
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
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( mb < 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a positive integer. Value: `%d`.', mb ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a positive integer. Value: `%d`.', nb ) );
	}
	if ( K > 0 && nb > K ) {
		throw new RangeError( format( 'invalid argument. Eighth argument (nb) must satisfy 1 <= nb <= K. Value: `%d`.', nb ) );
	}
	Q = ( side === 'left' ) ? M : N;
	if ( K > Q ) {
		throw new RangeError( format( 'invalid argument. Sixth argument (K) must satisfy K <= M when side=\'left\' or K <= N when side=\'right\'. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && LDA < max( 1, Q ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument (LDA) must be greater than or equal to max(1,Q) where Q = M (side=\'left\') or N (side=\'right\'). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDA < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument (LDA) must be greater than or equal to max(1,K). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDT < nb ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument (LDT) must be greater than or equal to `nb`. Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument (LDT) must be greater than or equal to max(1,K). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument (LDC) must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument (LDC) must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
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
		var minWork = ( side === 'left' ) ? Math.max( 1, N ) * nb : Math.max( 1, mb ) * nb;
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( side, trans, M, N, K, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, strideWork, 0 );
}


// EXPORTS //

export default dlamtsqr;
