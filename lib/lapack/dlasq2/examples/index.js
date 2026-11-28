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
import dlasq2 from './../lib/index.js';

/**
* Returns the qd array `[ q1, e1, q2, e2, ..., qN ]` (length `4*N`) of an upper bidiagonal matrix with diagonal `[ 4, 3, 2, 1 ]` and superdiagonal `[ 1, 0.5, 0.25 ]`.
*
* @private
* @returns {Float64Array} qd array
*/
function qd() {
	const z = new Float64Array( 16 );
	z.set( [ 16.0, 1.0, 9.0, 0.25, 4.0, 0.0625, 1.0 ] );
	return z;
}

const N = 4;

// Using the standard interface (on exit, `z[0:N]` holds the eigenvalues, i.e. the squared singular values):
let z = qd();
let info = dlasq2( N, z, 1 );
console.log( info, z.subarray( 0, N ) ); // eslint-disable-line no-console

// Using the ndarray interface:
z = qd();
info = dlasq2.ndarray( N, z, 1, 0 );
console.log( info, z.subarray( 0, N ) ); // eslint-disable-line no-console
