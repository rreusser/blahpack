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
import ztpqrt2 from './../lib/index.js';

// Build a small complex `N`-by-`N` upper triangular `A` and an `M`-by-`N` upper triangular `B` (`L = M = N`):
var M = 3;
var N = 3;
var L = 3;
var A = new Complex128Array([
	2.0,
	0.1,
	0.0,
	0.0,
	0.0,
	0.0,
	0.3,
	-0.2,
	3.0,
	0.4,
	0.0,
	0.0,
	0.1,
	0.3,
	0.2,
	-0.1,
	4.0,
	0.2
]);
var B = new Complex128Array([
	1.1,
	0.5,
	0.0,
	0.0,
	0.0,
	0.0,
	0.4,
	-0.3,
	1.5,
	0.2,
	0.0,
	0.0,
	0.6,
	0.1,
	0.3,
	-0.4,
	1.7,
	0.3
]);
var T = new Complex128Array( N * N );

var info = ztpqrt2( 'column-major', M, N, L, A, N, B, M, T, N );

console.log( 'INFO =', info ); // eslint-disable-line no-console
console.log( 'R    =', A ); // eslint-disable-line no-console
console.log( 'V    =', B ); // eslint-disable-line no-console
console.log( 'T    =', T ); // eslint-disable-line no-console
