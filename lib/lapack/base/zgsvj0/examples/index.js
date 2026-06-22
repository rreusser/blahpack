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

/* eslint-disable max-len */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgsvj0 from './../lib/zgsvj0.js';

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var M = 4;
var N = 3;
var A = new Complex128Array( M * N );
var Av = reinterpret( A, 0 );
var d = new Complex128Array( N );
var dv = reinterpret( d, 0 );
var sva = new Float64Array( N );
var V = new Complex128Array( 1 );
var work = new Complex128Array( M );
var info;
var idx;
var s;
var i;
var j;

for ( i = 0; i < 2 * M * N; i++ ) {
	Av[ i ] = Math.sin( ( i + 1 ) * 0.31 );
}
for ( i = 0; i < N; i++ ) {
	dv[ i * 2 ] = 1.0;
}
for ( i = 0; i < N; i++ ) {
	s = 0;
	for ( j = 0; j < M; j++ ) {
		idx = ( ( i * M ) + j ) * 2;
		s += ( Av[ idx ] * Av[ idx ] ) + ( Av[ idx + 1 ] * Av[ idx + 1 ] );
	}
	sva[ i ] = Math.sqrt( s );
}

info = zgsvj0( 'column-major', 'no-v', M, N, A, M, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, M );
console.log( 'info: %d', info ); // eslint-disable-line no-console
console.log( 'sva: %s', sva.join( ', ' ) ); // eslint-disable-line no-console
