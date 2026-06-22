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

import base from './base.js';


// MAIN //

/**
* Generates a plane rotation so that:
*
* ```text
* [  C         S  ] . [ F ]  =  [ R ]
* [ -conjg(S)  C  ]   [ G ]     [ 0 ]
* ```
*
* where C is real and `C**2 + |S|**2 = 1`.
*
* @param {Complex128Array} f - first component (input only)
* @param {NonNegativeInteger} offsetF - index offset for `f` (in complex elements)
* @param {Complex128Array} g - second component (input only)
* @param {NonNegativeInteger} offsetG - index offset for `g` (in complex elements)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @param {NonNegativeInteger} offsetS - index offset for `s` (in complex elements)
* @param {Complex128Array} r - on exit, the complex result
* @param {NonNegativeInteger} offsetR - index offset for `r` (in complex elements)
* @returns {void}
*/
function zlartg( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR ) {
	return base( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR );
}


// EXPORTS //

export default zlartg;
