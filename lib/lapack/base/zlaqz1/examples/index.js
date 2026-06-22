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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqz1 from './../lib/index.js';

// Construct a 5x5 complex pencil (A, B) with a small bulge at (2,1).
var N = 5;
var A = new Complex128Array( N * N );
var B = new Complex128Array( N * N );
var Q = new Complex128Array( N * N );
var Z = new Complex128Array( N * N );

var i;
var j;
for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < N; i++ ) {
		A.set( [ i + ( 2 * j ) + 1, ( i - j ) * 0.3 ], ( j * N ) + i );
		if ( i <= j ) {
			B.set( [ ( i + j + 2 ) * 0.5, ( j - i ) * 0.2 ], ( j * N ) + i );
		}
	}
	Q.set( [ 1.0, 0.0 ], ( j * N ) + j );
	Z.set( [ 1.0, 0.0 ], ( j * N ) + j );
}

// Inject a bulge at (2,1) (0-based):
B.set( [ 0.7, -0.4 ], ( 1 * N ) + 2 );
A.set( [ 1.5, 0.6 ], ( 1 * N ) + 2 );

zlaqz1( 'column-major', true, true, 1, 0, N - 1, N - 1, A, N, B, N, N, 0, Q, N, N, 0, Z, N );

console.log( reinterpret( A, 0 ) );
console.log( reinterpret( B, 0 ) );
