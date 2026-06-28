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
* Reduce NB columns of a general matrix in Hessenberg form.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} K - offset for the reduction
* @param {NonNegativeInteger} nb - number of columns to reduce
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} tau - input array
* @param {integer} strideTAU - `tau` stride length
* @param {Float64Array} t - input array
* @param {integer} strideT - `t` stride length
* @param {*} ldt - ldt
* @param {Float64Array} y - input array
* @param {integer} strideY - `y` stride length
* @param {*} ldy - ldy
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlahr2( order, N, K, nb, A, LDA, tau, strideTAU, t, strideT, ldt, y, strideY, ldy ) {
	var sa1;
	var sa2;
	var otau;
	var ott;
	var oy;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	otau = stride2offset( N, strideTAU );
	ott = stride2offset( N, strideT );
	oy = stride2offset( N, strideY );
	return base( N, K, nb, A, sa1, sa2, 0, tau, strideTAU, otau, t, strideT, ott, ldt, y, strideY, oy, ldy );
}


// EXPORTS //

export default dlahr2;
