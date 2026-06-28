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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of the M-by-N matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - total number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} offset - number of rows already factored
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - input array
* @param {integer} strideJPVT - `JPVT` stride length
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {Float64Array} VN1 - input array
* @param {integer} strideVN1 - `VN1` stride length
* @param {Float64Array} VN2 - input array
* @param {integer} strideVN2 - `VN2` stride length
* @param {Complex128Array} WORK - input array
* @param {integer} strideWork - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlaqp2( order, M, N, offset, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, WORK, strideWork ) {
	var sa1;
	var sa2;
	var oj;
	var ot;
	var ovn1;
	var ovn2;
	var ow;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	oj = stride2offset( N, strideJPVT );
	ot = stride2offset( N, strideTAU );
	ovn1 = stride2offset( N, strideVN1 );
	ovn2 = stride2offset( N, strideVN2 );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	ow = stride2offset( N, strideWork );
	return base( M, N, offset, A, sa1, sa2, 0, JPVT, strideJPVT, oj, TAU, strideTAU, ot, VN1, strideVN1, ovn1, VN2, strideVN2, ovn2, WORK, strideWork, ow );
}


// EXPORTS //

export default zlaqp2;
