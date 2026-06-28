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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns.
*
* @param {NonNegativeInteger} M - total number of rows
* @param {NonNegativeInteger} P - number of rows in `X11`
* @param {NonNegativeInteger} Q - number of columns
* @param {Complex128Array} X11 - top block (`P`-by-`Q`)
* @param {integer} strideX111 - stride of the first dimension of `X11`
* @param {integer} strideX112 - stride of the second dimension of `X11`
* @param {NonNegativeInteger} offsetX11 - starting index for `X11`
* @param {Complex128Array} X21 - bottom block (`(M-P)`-by-`Q`)
* @param {integer} strideX211 - stride of the first dimension of `X21`
* @param {integer} strideX212 - stride of the second dimension of `X21`
* @param {NonNegativeInteger} offsetX21 - starting index for `X21`
* @param {Float64Array} THETA - output array (length at least `Q`)
* @param {integer} strideTHETA - stride length for `THETA`
* @param {NonNegativeInteger} offsetTHETA - starting index for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`)
* @param {integer} stridePHI - stride length for `PHI`
* @param {NonNegativeInteger} offsetPHI - starting index for `PHI`
* @param {Complex128Array} TAUP1 - output array (length at least `P-1`)
* @param {integer} strideTAUP1 - stride length for `TAUP1`
* @param {NonNegativeInteger} offsetTAUP1 - starting index for `TAUP1`
* @param {Complex128Array} TAUP2 - output array (length at least `Q`)
* @param {integer} strideTAUP2 - stride length for `TAUP2`
* @param {NonNegativeInteger} offsetTAUP2 - starting index for `TAUP2`
* @param {Complex128Array} TAUQ1 - output array (length at least `Q`)
* @param {integer} strideTAUQ1 - stride length for `TAUQ1`
* @param {NonNegativeInteger} offsetTAUQ1 - starting index for `TAUQ1`
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `P` must satisfy `0 <= P <= min(M-P, Q, M-Q)`
* @throws {RangeError} `Q` must satisfy `0 <= Q <= M`
* @returns {integer} `info` (0 = success)
*/
function zunbdb2( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( Q < 0 || Q > M ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy 0 <= Q <= M. Value: `%d`.', Q ) );
	}
	if ( P < 0 || P > M - P || P > Q || P > M - Q ) {
		throw new RangeError( format( 'invalid argument. Second argument must satisfy 0 <= P <= min(M-P, Q, M-Q). Value: `%d`.', P ) );
	}
	return base( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zunbdb2;
