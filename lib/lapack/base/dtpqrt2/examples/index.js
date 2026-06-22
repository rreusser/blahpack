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
import dtpqrt2 from './../lib/index.js';

// Build a small `N`-by-`N` upper triangular `A` and an `M`-by-`N` upper triangular `B` (`L = M = N`):
var M = 3;
var N = 3;
var L = 3;
var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.5, 3.0, 0.0, 0.25, 0.75, 4.0 ] );
var B = new Float64Array( [ 1.1, 0.0, 0.0, 0.4, 1.5, 0.0, 0.6, 0.3, 1.7 ] );
var T = new Float64Array( N * N );

var info = dtpqrt2( 'column-major', M, N, L, A, N, B, M, T, N );

console.log( 'INFO =', info ); // eslint-disable-line no-console
console.log( 'R    =', A ); // eslint-disable-line no-console
console.log( 'V    =', B ); // eslint-disable-line no-console
console.log( 'T    =', T ); // eslint-disable-line no-console
