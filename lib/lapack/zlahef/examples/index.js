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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahef from './../lib/index.js';

const N = 4;
const nb = 2;

/**
* Returns a 4x4 Hermitian matrix (column-major, interleaved real/imaginary parts).
*
* @private
* @returns {Complex128Array} matrix
*/
function hermitian() {
	return new Complex128Array([
		4.0, 0.0, 1.0, -1.0, 2.0, 0.0, 0.0, 1.0,
		1.0, 1.0, 5.0, 0.0, 1.0, 2.0, 3.0, 0.0,
		2.0, 0.0, 1.0, -2.0, 6.0, 0.0, 1.0, -1.0,
		0.0, -1.0, 3.0, 0.0, 1.0, 1.0, 7.0, 0.0
	]);
}

const kb = new Int32Array( 1 );
let A = hermitian();
let IPIV = new Int32Array( N );
let W = new Complex128Array( N * nb );

// Using the standard interface (partially factor the upper triangle):
let info = zlahef( 'column-major', 'upper', N, nb, kb, A, N, IPIV, 1, W, N );
let out = {
	'info': info,
	'kb': kb[ 0 ]
};
console.log( out );
console.log( IPIV );

// Using the ndarray interface:
A = hermitian();
IPIV = new Int32Array( N );
W = new Complex128Array( N * nb );
info = zlahef.ndarray( 'upper', N, nb, kb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
out = {
	'info': info,
	'kb': kb[ 0 ]
};
console.log( out );
console.log( IPIV );
