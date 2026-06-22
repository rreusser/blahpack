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

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the Schur factorization of a real 2-by-2 nonsymmetric matrix in standard form.
*
* @param {number} a - the (1,1) element of the matrix
* @param {number} b - the (1,2) element of the matrix
* @param {number} c - the (2,1) element of the matrix
* @param {number} d - the (2,2) element of the matrix
* @returns {Object} object with fields: `a`, `b`, `c`, `d` (Schur form), `rt1r`, `rt1i`, `rt2r`, `rt2i` (eigenvalues), `cs`, `sn` (rotation)
*/
function dlanv2( a, b, c, d ) {
	return base( a, b, c, d );
}


// EXPORTS //

export default dlanv2;
