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
* Simultaneously bidiagonalizes the blocks of a tall and skinny matrix `[X11; X21]` with orthonormal columns.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - total number of rows
* @param {NonNegativeInteger} P - number of rows in `X11`
* @param {NonNegativeInteger} Q - number of columns
* @param {Float64Array} X11 - top block (`P`-by-`Q`)
* @param {PositiveInteger} LDX11 - leading dimension of `X11`
* @param {Float64Array} X21 - bottom block (`(M-P)`-by-`Q`)
* @param {PositiveInteger} LDX21 - leading dimension of `X21`
* @param {Float64Array} THETA - output array (length at least `Q`)
* @param {integer} strideTHETA - stride length for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`)
* @param {integer} stridePHI - stride length for `PHI`
* @param {Float64Array} TAUP1 - output array (length at least `P`)
* @param {integer} strideTAUP1 - stride length for `TAUP1`
* @param {Float64Array} TAUP2 - output array (length at least `M-P`)
* @param {integer} strideTAUP2 - stride length for `TAUP2`
* @param {Float64Array} TAUQ1 - output array (length at least `Q`)
* @param {integer} strideTAUQ1 - stride length for `TAUQ1`
* @param {Float64Array} WORK - workspace (length at least `M-Q`)
* @param {integer} strideWORK - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `P` must satisfy `P >= Q && M-P >= Q`
* @throws {RangeError} `Q` must satisfy `Q >= 0 && M-Q >= Q`
* @throws {RangeError} `LDX11` must satisfy the leading-dimension constraint
* @throws {RangeError} `LDX21` must satisfy the leading-dimension constraint
* @returns {integer} `info` (0 = success)
*/
function dorbdb1( order, M, P, Q, X11, LDX11, X21, LDX21, THETA, strideTHETA, PHI, stridePHI, TAUP1, strideTAUP1, TAUP2, strideTAUP2, TAUQ1, strideTAUQ1, WORK, strideWORK ) {
	var sx111;
	var sx112;
	var sx211;
	var sx212;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( P < Q || M - P < Q ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy P >= Q and M-P >= Q. Value: `%d`.', P ) );
	}
	if ( Q < 0 || M - Q < Q ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy 0 <= Q <= M-Q. Value: `%d`.', Q ) );
	}
	if ( order === 'column-major' ) {
		if ( LDX11 < max( 1, P ) ) {
			throw new RangeError( format( 'invalid argument. `LDX11` must satisfy LDX11 >= max(1,P). Value: `%d`.', LDX11 ) );
		}
		if ( LDX21 < max( 1, M - P ) ) {
			throw new RangeError( format( 'invalid argument. `LDX21` must satisfy LDX21 >= max(1,M-P). Value: `%d`.', LDX21 ) );
		}
		sx111 = 1;
		sx112 = LDX11;
		sx211 = 1;
		sx212 = LDX21;
	} else {
		if ( LDX11 < max( 1, Q ) ) {
			throw new RangeError( format( 'invalid argument. `LDX11` must satisfy LDX11 >= max(1,Q). Value: `%d`.', LDX11 ) );
		}
		if ( LDX21 < max( 1, Q ) ) {
			throw new RangeError( format( 'invalid argument. `LDX21` must satisfy LDX21 >= max(1,Q). Value: `%d`.', LDX21 ) );
		}
		sx111 = LDX11;
		sx112 = 1;
		sx211 = LDX21;
		sx212 = 1;
	}
	return base( M, P, Q, X11, sx111, sx112, 0, X21, sx211, sx212, 0, THETA, strideTHETA, 0, PHI, stridePHI, 0, TAUP1, strideTAUP1, 0, TAUP2, strideTAUP2, 0, TAUQ1, strideTAUQ1, 0, WORK, strideWORK, 0 );
}


// EXPORTS //

export default dorbdb1;
