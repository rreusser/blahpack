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
import dlaqr0 from './../lib/index.js';

/**
* Sets a column-major N-by-N matrix to the identity.
*
* @private
* @param {Float64Array} v - matrix elements (real view)
* @param {PositiveInteger} k - number of real values per element
*/
function setIdentity( v, k ) {
	let i;
	for ( i = 0; i < N; i++ ) {
		v[ k * ( ( i * N ) + i ) ] = 1.0;
	}
}

const N = 4;

// 4-by-4 upper Hessenberg matrix (column-major):
let H = new Float64Array( [ 4.0, 1.0, 0.0, 0.0, 3.0, 2.0, 1.0, 0.0, 2.0, 1.0, 3.0, 2.0, 1.0, 2.0, 1.0, 1.0 ] );
let Z = new Float64Array( N * N );
let WR = new Float64Array( N );
let WI = new Float64Array( N );
let WORK = new Float64Array( N );
setIdentity( Z, 1 );

// Using the standard interface (Schur form and Schur vectors):
let info = dlaqr0( 'column-major', true, true, N, 1, N, H, N, WR, 1, WI, 1, 1, N, Z, N, WORK );
console.log( info );
console.log( WR );
console.log( WI );

// Using the ndarray interface:
H = new Float64Array( [ 4.0, 1.0, 0.0, 0.0, 3.0, 2.0, 1.0, 0.0, 2.0, 1.0, 3.0, 2.0, 1.0, 2.0, 1.0, 1.0 ] );
Z = new Float64Array( N * N );
WR = new Float64Array( N );
WI = new Float64Array( N );
WORK = new Float64Array( N );
setIdentity( Z, 1 );
info = dlaqr0.ndarray( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 );
console.log( info );
console.log( WR );
console.log( WI );
