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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant) using a general complex banded matrix to calculate error bounds.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} kl - number of sub-diagonals of `A`
* @param {NonNegativeInteger} ku - number of super-diagonals of `A`
* @param {number} alpha - scalar constant
* @param {Complex128Array} AB - input banded matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output real vector
* @param {integer} strideY - stride length for `y`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `kl+ku+1`
* @returns {Float64Array} `y`
*/
function zla_gbamv( order, trans, M, N, kl, ku, alpha, AB, LDAB, x, strideX, beta, y, strideY ) {
	var lenx;
	var leny;
	var sab1;
	var sab2;
	var ox;
	var oy;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	if ( LDAB < max( 1, kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,kl+ku+1). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
	} else {
		sab1 = LDAB;
		sab2 = 1;
	}
	if ( trans === 'no-transpose' ) {
		lenx = N;
		leny = M;
	} else {
		lenx = M;
		leny = N;
	}
	ox = stride2offset( lenx, strideX );
	oy = stride2offset( leny, strideY );
	return base( trans, M, N, kl, ku, alpha, AB, sab1, sab2, 0, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default zla_gbamv;
