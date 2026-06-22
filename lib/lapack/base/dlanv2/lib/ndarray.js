/**
* @license Apache-2.0
*
* Copyright (C) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain A copy of the License at
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
* Computes the Schur factorization of A real 2-by-2 nonsymmetric matrix in standard form.
*
* @param {number} A - the (1,1) element of the matrix
* @param {number} B - the (1,2) element of the matrix
* @param {number} C - the (2,1) element of the matrix
* @param {number} D - the (2,2) element of the matrix
* @returns {Object} object with fields: `A`, `B`, `C`, `D` (Schur form), `rt1r`, `rt1i`, `rt2r`, `rt2i` (eigenvalues), `cs`, `sn` (rotation)
*/
function dlanv2( A, B, C, D ) {
	return base( A, B, C, D );
}


// EXPORTS //

export default dlanv2;
