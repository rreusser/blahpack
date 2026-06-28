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
* Form the triangular factor T of a complex block reflector H of order N.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} V - input matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {Complex128Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlarft( order, direct, storev, N, K, V, LDV, TAU, strideTAU, T, LDT ) {
	var sv1;
	var sv2;
	var st1;
	var st2;
	var ot;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( direct !== 'forward' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `direct` value. Value: `%s`.', direct ) );
	}
	if ( storev !== 'columnwise' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `storev` value. Value: `%s`.', storev ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	ot = stride2offset( N, strideTAU );
	return base( direct, storev, N, K, V, sv1, sv2, 0, TAU, strideTAU, ot, T, st1, st2, 0 );
}


// EXPORTS //

export default zlarft;
