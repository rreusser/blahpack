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
import dlaqz2 from './../lib/index.js';

// Set up a 5x5 upper-Hessenberg `A` and upper-triangular `B` with a 2x2 bulge at rows 1..2, cols 0..1 (column-major layout):
var N = 5;
var A = new Float64Array([
	1.2, 0.9, 0.4, 0.0, 0.0,
	0.8, 1.5, 0.3, 0.7, 0.0,
	0.5, 0.6, 1.8, 0.9, 0.4,
	0.2, 0.3, 0.7, 2.0, 0.5,
	0.1, 0.2, 0.4, 0.6, 2.2
]);
var B = new Float64Array([
	2.1, 0.5, 0.7, 0.0, 0.0,
	0.0, 2.3, 0.4, 0.0, 0.0,
	0.0, 0.0, 2.5, 0.3, 0.0,
	0.0, 0.0, 0.0, 2.7, 0.2,
	0.0, 0.0, 0.0, 0.0, 2.9
]);
var Q = new Float64Array([ 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1 ]);
var Z = new Float64Array([ 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1 ]);

dlaqz2( 'column-major', true, true, 0, 0, N - 1, N - 1, A, N, B, N, N, 0, Q, N, N, 0, Z, N );

console.log( A ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console
