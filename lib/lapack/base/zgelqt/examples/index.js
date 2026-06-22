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
import zgelqt from './../lib/index.js';

var M = 4;
var N = 6;
var mb = 2;
var k = ( M < N ) ? M : N;

// Column-major M-by-N input matrix (interleaved real/imaginary entries):
var A = new Complex128Array([
	3.0,
	0.1,
	0.5,
	-0.3,
	0.2,
	0.5,
	0.4,
	-0.1,
	0.6,
	-0.2,
	4.0,
	0.4,
	0.5,
	-0.3,
	0.3,
	0.4,
	0.4,
	0.3,
	0.7,
	-0.2,
	3.5,
	0.2,
	0.5,
	-0.5,
	0.2,
	-0.1,
	0.3,
	0.5,
	0.8,
	-0.4,
	4.5,
	0.3,
	0.1,
	0.4,
	-0.2,
	-0.4,
	0.6,
	0.1,
	1.1,
	-0.2,
	-0.3,
	0.2,
	0.5,
	0.1,
	0.1,
	-0.5,
	-0.5,
	0.4
]);

// mb-by-K block triangular factor (output):
var T = new Complex128Array( mb * k );

// Workspace:
var WORK = new Complex128Array( mb * N );

var info = zgelqt( 'column-major', M, N, mb, A, M, T, mb, WORK );

console.log( 'info = %d', info );
console.log( A );
console.log( T );
