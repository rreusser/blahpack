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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the singular values and, optionally, the right and/or left.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {*} uplo - uplo
* @param {*} N - N
* @param {*} ncvt - ncvt
* @param {*} nru - nru
* @param {*} ncc - ncc
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {Complex128Array} VT - input matrix
* @param {PositiveInteger} LDVT - leading dimension of `VT`
* @param {Complex128Array} U - input matrix
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Complex128Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} RWORK - input array
* @param {integer} strideRWORK - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @returns {number} |a| * sign(b)
*/
function zbdsqr( order, uplo, N, ncvt, nru, ncc, d, strideD, e, strideE, VT, LDVT, U, LDU, C, LDC, RWORK, strideRWORK ) {
	var sv1;
	var sv2;
	var su1;
	var su2;
	var sc1;
	var sc2;
	var od;
	var oe;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDVT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVT ) );
	}
	if ( LDU < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDU ) );
	}
	if ( LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDVT;
		su1 = 1;
		su2 = LDU;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sv1 = LDVT;
		sv2 = 1;
		su1 = LDU;
		su2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	or = stride2offset( N, strideRWORK );
	return base( uplo, N, ncvt, nru, ncc, d, strideD, od, e, strideE, oe, VT, sv1, sv2, 0, U, su1, su2, 0, C, sc1, sc2, 0, RWORK, strideRWORK, or );
}


// EXPORTS //

export default zbdsqr;
