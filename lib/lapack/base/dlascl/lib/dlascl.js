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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a real M-by-N matrix A by the real scalar CTO/CFROM, doing.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} type - `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
* @param {integer} kl - lower bandwidth (for banded types)
* @param {integer} ku - upper bandwidth (for banded types)
* @param {number} cfrom - scale denominator (must be nonzero)
* @param {number} cto - scale numerator
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlascl( order, type, kl, ku, cfrom, cto, M, N, A, LDA ) {
	var sa1;
	var sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( type !== 'general' && type !== 'lower' && type !== 'upper' && type !== 'upper-hessenberg' && type !== 'lower-band' && type !== 'upper-band' && type !== 'band' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `type` value. Value: `%s`.', type ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	return base( type, kl, ku, cfrom, cto, M, N, A, sa1, sa2, 0 );
}


// EXPORTS //

export default dlascl;
