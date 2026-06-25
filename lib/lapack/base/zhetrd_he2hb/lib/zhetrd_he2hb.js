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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex Hermitian matrix `A` to complex Hermitian band-diagonal form `AB` by a unitary similarity transformation.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals of the reduced band matrix
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AB - output band-diagonal matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} TAU - output reflector scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Complex128Array|null)} WORK - workspace (`null` to allocate internally)
* @param {integer} strideWork - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to max(1,N)
* @throws {RangeError} eighth argument must be greater than or equal to kd+1
* @returns {integer} status code (0 = success)
*/
function zhetrd_he2hb( order, uplo, N, kd, A, LDA, AB, LDAB, TAU, strideTAU, WORK, strideWork ) {
	var work;
	var sab1;
	var sab2;
	var sa1;
	var sa2;
	var sw;
	var nb;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAB < kd + 1 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to kd+1. Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sab1 = 1;
		sab2 = LDAB;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sab1 = LDAB;
		sab2 = 1;
	}
	if ( WORK ) {
		work = WORK;
		sw = strideWork;
	} else {
		nb = ( kd > 32 ) ? kd : 32;
		work = new Complex128Array( Math.max( 1, (N * kd) + (N * nb) + (2 * kd * kd) ) );
		sw = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, LWORK );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( uplo, N, kd, A, sa1, sa2, 0, AB, sab1, sab2, 0, TAU, strideTAU, 0, work, sw, 0 );
}


// EXPORTS //

export default zhetrd_he2hb;
