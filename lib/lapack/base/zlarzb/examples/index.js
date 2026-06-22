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
import zlarzb from './../lib/index.js';

var M = 4;
var N = 3;
var K = 2;
var L = 2;
var V = new Complex128Array( [ 0.2, 0.1, 0.4, -0.3, -0.1, 0.3, 0.5, 0.2 ] );
var T = new Complex128Array( [ 0.7, 0.1, 0.3, -0.2, 0.0, 0.0, 0.5, 0.3 ] );
var C = new Complex128Array( 2 * M * N );
var Cv = reinterpret( C, 0 );
var WORK = new Complex128Array( N * K );
var i;

for ( i = 0; i < M * N; i += 1 ) {
	Cv[ i * 2 ] = i + 1;
	Cv[ ( i * 2 ) + 1 ] = 0.1 * i;
}

zlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, N, 0 );

console.log( reinterpret( C, 0 ) ); // eslint-disable-line no-console
