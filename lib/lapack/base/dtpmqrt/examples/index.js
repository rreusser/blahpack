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
import { ndarray as dtpmqrt } from './../lib/index.js';

// Compact-WY pentagonal V/T from a triangular-pentagonal QR factorization (precomputed via dtpqrt with M=4, N=K=3, L=2, NB=2).
var V = new Float64Array([
	0.15924183741352385,
	0.04549766783243539,
	0.25023717307839466,
	0.0,
	0.014412084326773106,
	0.13246698654742029,
	0.027151043476800821,
	0.18914626045860963,
	0.029645061551314057,
	-0.020697110843746255,
	0.04207135793691393,
	0.04667473505940238
]);
var T = new Float64Array([
	1.8347838711296822,
	0.0,
	-0.052614406805809984,
	1.8970495893030177,
	1.9895434963150385,
	0.0
]);

// Apply Q from the left to a stacked C = [A; B] with A = 3x3 identity-ish, B = 4x3.
var A = new Float64Array([
	1.0,
	4.0,
	7.0,
	2.0,
	5.0,
	8.0,
	3.0,
	6.0,
	9.0
]);
var B = new Float64Array([
	1.0,
	0.5,
	-1.0,
	2.0,
	-1.0,
	1.5,
	0.0,
	-2.0,
	2.0,
	-2.5,
	3.0,
	1.0
]);
var WORK = new Float64Array( 3 * 2 );

// dtpmqrt.ndarray( side, trans, M, N, K, l, nb, V, sV1, sV2, oV, T, sT1, sT2, oT, A, sA1, sA2, oA, B, sB1, sB2, oB, WORK, sW, oW )
dtpmqrt( 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 1, 4, 0, T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );

console.log( A ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console
