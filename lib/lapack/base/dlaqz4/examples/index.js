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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz4 from './../lib/index.js';

var N = 6;
var A = new Float64Array( N * N );
var B = new Float64Array( N * N );
var Q = new Float64Array( N * N );
var Z = new Float64Array( N * N );
var QC = new Float64Array( N * N );
var ZC = new Float64Array( N * N );
var WORK = new Float64Array( N * 4 );
var SR = new Float64Array( [ 1.5, 1.5 ] );
var SI = new Float64Array( [ 0.3, -0.3 ] );
var SS = new Float64Array( [ 1.0, 1.0 ] );
var info;
var i;
var j;

// Build a small Hessenberg-triangular pencil (A, B) of order N=6, column-major:
for ( j = 1; j <= N; j++ ) {
	for ( i = 1; i <= N; i++ ) {
		if ( i <= j + 1 ) {
			A[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 1.0 + ( 0.1 * ( i + ( 2 * j ) ) ) + ( 0.03 * i * j );
		}
		if ( i <= j ) {
			B[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 2.0 + ( 0.2 * ( j - i ) ) + ( 0.05 * j );
		}
	}
}
for ( i = 0; i < N; i++ ) {
	Q[ i + ( i * N ) ] = 1.0;
	Z[ i + ( i * N ) ] = 1.0;
}

// Apply a single 2-shift QZ sweep over the full Schur form:
info = dlaqz4( 'column-major', true, true, true, N, 0, N - 1, 2, 4, SR, 1, SI, 1, SS, 1, A, N, B, N, Q, N, Z, N, QC, N, ZC, N, WORK, 1 );

console.log( 'info = ' + info ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
