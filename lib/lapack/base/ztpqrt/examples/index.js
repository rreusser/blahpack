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
import ztpqrt from './../lib/index.js';

// Upper triangular N-by-N matrix A (column-major, complex):
var A = new Complex128Array( 16 );

// Pentagonal M-by-N matrix B with l=2 upper-trapezoidal trailing rows (column-major, complex):
var B = new Complex128Array( 16 );

// Block reflector storage T: rows = nb, columns = N (concatenation of per-panel nb-by-ib blocks)
var nb = 2;
var T = new Complex128Array( nb * 4 );

// Workspace: at least nb*N complex elements
var WORK = new Complex128Array( nb * 4 );

var info;

reinterpret( A, 0 ).set([
	2.0,
	0.1,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.5,
	0.0,
	3.0,
	-0.2,
	0.0,
	0.0,
	0.0,
	0.0,
	0.25,
	-0.1,
	0.75,
	0.0,
	4.0,
	0.3,
	0.0,
	0.0,
	0.1,
	0.0,
	0.2,
	0.1,
	0.3,
	-0.1,
	5.0,
	0.0
]);

reinterpret( B, 0 ).set([
	1.0,
	0.3,
	0.3,
	-0.1,
	0.7,
	0.2,
	0.0,
	0.0,
	0.5,
	0.2,
	1.1,
	0.0,
	0.4,
	0.0,
	1.3,
	0.2,
	0.25,
	-0.1,
	0.6,
	0.1,
	1.2,
	0.3,
	0.5,
	-0.3,
	0.1,
	0.0,
	0.2,
	-0.1,
	0.9,
	-0.2,
	0.6,
	0.1
]);

info = ztpqrt( 'column-major', 4, 4, 2, nb, A, 4, B, 4, T, nb, WORK );
console.log( 'info: ' + info ); // eslint-disable-line no-console
console.log( T ); // eslint-disable-line no-console
