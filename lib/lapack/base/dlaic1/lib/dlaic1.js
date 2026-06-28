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

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies one step of incremental condition estimation.
*
* @param {string} job - specifies whether to estimate the largest or smallest singular value (`'largest-singular-value'` or `'smallest-singular-value'`)
* @param {NonNegativeInteger} J - length of `x` and `w`
* @param {Float64Array} x - input vector of length `J`
* @param {integer} strideX - stride length for `x`
* @param {number} sest - estimated singular value of the `j`-by-`j` matrix
* @param {Float64Array} w - input vector of length `J`
* @param {integer} strideW - stride length for `w`
* @param {number} gamma - diagonal element
* @param {Float64Array} out - output array; on exit, `out[0]` is `sestpr`, `out[1]` is `s`, `out[2]` is `c`
* @returns {Float64Array} `out`
*/
function dlaic1( job, J, x, strideX, sest, w, strideW, gamma, out ) {
	var ox = stride2offset( J, strideX );
	var ow = stride2offset( J, strideW );
	return base( job, J, x, strideX, ox, sest, w, strideW, ow, gamma, out ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaic1;
