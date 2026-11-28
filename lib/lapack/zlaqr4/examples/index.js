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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr4 from './../lib/index.js';

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
let H = new Complex128Array( [ 4.0, 1.0, 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 3.0, -1.0, 2.0, 0.0, 1.0, 1.0, 0.0, 0.0, 2.0, 0.5, 1.0, -1.0, 3.0, 0.0, 2.0, 0.5, 1.0, 0.0, 2.0, 1.0, 1.0, -0.5, 1.0, 1.0 ] );
let Z = new Complex128Array( N * N );
let w = new Complex128Array( N );
let WORK = new Complex128Array( N );
setIdentity( reinterpret( Z, 0 ), 2 );

// Using the standard interface (Schur form and Schur vectors):
let info = zlaqr4( 'column-major', true, true, N, 1, N, H, N, w, 1, 1, N, Z, N, WORK );
console.log( info );
console.log( reinterpret( w, 0 ) );

// Using the strided interface:
H = new Complex128Array( [ 4.0, 1.0, 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 3.0, -1.0, 2.0, 0.0, 1.0, 1.0, 0.0, 0.0, 2.0, 0.5, 1.0, -1.0, 3.0, 0.0, 2.0, 0.5, 1.0, 0.0, 2.0, 1.0, 1.0, -0.5, 1.0, 1.0 ] );
Z = new Complex128Array( N * N );
w = new Complex128Array( N );
WORK = new Complex128Array( N );
setIdentity( reinterpret( Z, 0 ), 2 );
info = zlaqr4.strided( true, true, N, 1, N, H, 1, N, 0, w, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 );
console.log( info );
console.log( reinterpret( w, 0 ) );
