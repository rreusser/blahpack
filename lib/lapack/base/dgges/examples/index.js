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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgges from './../lib/index.js';

// 3x3 matrices (column-major):
var A = new Float64Array( [ 1, 4, 7, 2, 5, 8, 3, 6, 10 ] );
var B = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
var ALPHAR = new Float64Array( 3 );
var ALPHAI = new Float64Array( 3 );
var BETA = new Float64Array( 3 );
var VSL = new Float64Array( 9 );
var VSR = new Float64Array( 9 );
var result;

/**
* Dummy selection function that selects no eigenvalues.
*
* @private
* @returns {boolean} false
*/
function noop() {
	return false;
}

result = dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'not-sorted', noop, 3, A, 3, B, 3, ALPHAR, ALPHAI, BETA, VSL, 3, VSR, 3 ); // eslint-disable-line max-len

console.log( 'info:', result.info ); // eslint-disable-line no-console
console.log( 'sdim:', result.sdim ); // eslint-disable-line no-console
console.log( 'alphar:', ALPHAR ); // eslint-disable-line no-console
console.log( 'alphai:', ALPHAI ); // eslint-disable-line no-console
console.log( 'beta:', BETA ); // eslint-disable-line no-console
