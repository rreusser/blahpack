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
import dgetsqrhrt from './../lib/index.js';

var M = 8;
var N = 3;
var mb1 = 4;
var nb1 = 2;
var nb2 = 2;
var nb2local = Math.min( nb2, N );
var A = new Float64Array( M * N );
var T = new Float64Array( nb2local * N );
var WORK = new Float64Array( 256 );
var info;
var i;
var j;

// Build a deterministic input matrix (column-major, M-by-N).
for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < M; i++ ) {
		A[ i + ( j * M ) ] = Math.sin( ( i + 1 ) + ( 3 * ( j + 1 ) ) ) + 0.5;
		if ( i === j ) {
			A[ i + ( j * M ) ] += 4.0;
		}
	}
}

info = dgetsqrhrt( 'column-major', M, N, mb1, nb1, nb2, A, M, T, nb2local, WORK );
console.log( 'INFO = ' + info ); // eslint-disable-line no-console
console.log( 'A (R in upper triangle, V below) = ' ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
console.log( 'T = ' ); // eslint-disable-line no-console
console.log( T ); // eslint-disable-line no-console
