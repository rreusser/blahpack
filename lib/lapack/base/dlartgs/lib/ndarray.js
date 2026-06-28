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

import base from './base.js';


// MAIN //

/**
* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem.
*
* @param {number} x - the `(1,1)` entry of an upper bidiagonal matrix
* @param {number} y - the `(1,2)` entry of an upper bidiagonal matrix
* @param {number} sigma - shift
* @param {Float64Array} out - output array; on return `out[0]=cs`, `out[1]=sn`
* @returns {Float64Array} `out`
*/
function dlartgs( x, y, sigma, out ) {
	return base( x, y, sigma, out );
}


// EXPORTS //

export default dlartgs;
