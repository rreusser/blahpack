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
import { ndarray as dgerq2 } from './../../dgerq2/lib/index.js';
import dorgr2 from './../lib/index.js';

// 3x5 matrix in column-major order:
var M = 3;
var N = 5;
var K = 3;
var A = new Float64Array( [
	2, 1, 3,    // col 0
	1, 4, 2,    // col 1
	3, 2, 5,    // col 2
	1, 3, 2,    // col 3
	4, 2, 1     // col 4
] );
var TAU = new Float64Array( Math.min( M, N ) );
var WORK = new Float64Array( M );

// Compute the RQ factorization to populate the reflectors:
dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

// Reconstruct Q (M-by-N with orthonormal rows) from the reflectors:
var info = dorgr2( 'column-major', M, N, K, A, M, TAU, 1, WORK, 1 );
console.log( info );
console.log( A );
