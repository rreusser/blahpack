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
import zlatrz from './../lib/index.js';

// 3-by-5 column-major upper trapezoidal matrix A (l = N - M = 2):
var A = new Complex128Array([
	4.0,
	0.5,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	-0.2,
	5.0,
	0.3,
	0.0,
	0.0,
	2.0,
	0.3,
	1.0,
	0.1,
	6.0,
	0.4,
	3.0,
	0.1,
	2.0,
	0.2,
	1.0,
	-0.2,
	1.0,
	-0.4,
	4.0,
	-0.5,
	2.0,
	0.6
]);

// Scalar factors of the M elementary reflectors:
var TAU = new Complex128Array( 3 );

// Workspace (length >= M):
var work = new Complex128Array( 3 );

// Reduce A to upper triangular form R (stored in the leading 3x3 block of A):
zlatrz( 'column-major', 3, 5, 2, A, 3, TAU, 1, work, 1 );

console.log( A ); // eslint-disable-line no-console
console.log( TAU ); // eslint-disable-line no-console
