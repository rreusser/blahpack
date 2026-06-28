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
import dtplqt from './../lib/index.js';

// Lower triangular M-by-M matrix A (column-major):
var A = new Float64Array([
	2.0,
	0.5,
	0.25,
	0.1,
	0.0,
	3.0,
	0.75,
	0.2,
	0.0,
	0.0,
	4.0,
	0.3,
	0.0,
	0.0,
	0.0,
	5.0
]);

// Pentagonal M-by-N matrix B with l=2 lower-trapezoidal trailing columns (column-major):
var B = new Float64Array([
	1.0,
	0.3,
	0.7,
	0.2,
	0.5,
	1.1,
	0.4,
	0.3,
	0.25,
	0.6,
	1.2,
	0.4,
	0.0,
	0.2,
	0.9,
	1.3,
	0.0,
	0.0,
	0.0,
	0.6
]);

// Block reflector storage T: rows = mb, columns = M (concatenation of per-panel mb-by-ib blocks)
var mb = 2;
var T = new Float64Array( mb * 4 );

// Workspace: at least mb*M doubles
var WORK = new Float64Array( mb * 4 );

var info = dtplqt( 'column-major', 4, 5, 2, mb, A, 4, B, 4, T, mb, WORK );
console.log( 'info: ' + info ); // eslint-disable-line no-console
console.log( T ); // eslint-disable-line no-console
