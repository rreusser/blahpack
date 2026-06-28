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

/* eslint-disable camelcase, no-console */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrd_he2hb from './../lib/index.js';

var N = 6;
var kd = 2;
var A = new Complex128Array( N * N );
var ar = reinterpret( A, 0 );
var AB = new Complex128Array( ( kd + 1 ) * N );
var TAU = new Complex128Array( N - kd );
var info;
var idx;
var i;
var j;

// Build a small column-major Hermitian matrix A (real diagonal, conjugate-symmetric off-diagonal):
for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < N; i++ ) {
		idx = (j * N) + i;
		if ( i === j ) {
			ar[ 2*idx ] = 10 + i;
			ar[ (2*idx) + 1 ] = 0.0;
		} else if ( i < j ) {
			ar[ 2*idx ] = 1.0 / ( j - i + 1 );
			ar[ (2*idx) + 1 ] = 0.25 / ( j - i + 1 );
		} else {
			ar[ 2*idx ] = 1.0 / ( i - j + 1 );
			ar[ (2*idx) + 1 ] = -0.25 / ( i - j + 1 );
		}
	}
}

// Reduce A to lower Hermitian band form AB:
info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null, 1 );

console.log( 'info = %d', info );
console.log( 'AB (interleaved re/im) =' );
console.log( reinterpret( AB, 0 ) );
