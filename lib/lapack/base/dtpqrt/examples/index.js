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
import dtpqrt from './../lib/index.js';

// Upper triangular N-by-N matrix A (column-major):
var A = new Float64Array([
	2.0,
	0.0,
	0.0,
	0.0,
	0.5,
	3.0,
	0.0,
	0.0,
	0.25,
	0.75,
	4.0,
	0.0,
	0.1,
	0.2,
	0.3,
	5.0
]);

// Pentagonal M-by-N matrix B with l=2 upper-trapezoidal trailing rows (column-major):
var B = new Float64Array([
	1.0,
	0.3,
	0.7,
	0.0,
	0.5,
	1.1,
	0.4,
	1.3,
	0.25,
	0.6,
	1.2,
	0.5,
	0.1,
	0.2,
	0.9,
	0.6
]);

// Block reflector storage T: rows = nb, columns = N (concatenation of per-panel nb-by-ib blocks)
var nb = 2;
var T = new Float64Array( nb * 4 );

// Workspace: at least nb*N doubles
var WORK = new Float64Array( nb * 4 );

var info = dtpqrt( 'column-major', 4, 4, 2, nb, A, 4, B, 4, T, nb, WORK );
console.log( 'info: ' + info ); // eslint-disable-line no-console
console.log( T ); // eslint-disable-line no-console
