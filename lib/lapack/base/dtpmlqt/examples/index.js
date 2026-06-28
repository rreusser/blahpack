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
import { ndarray as dtpmlqt } from './../lib/index.js';

// Compact-WY pentagonal V/T from a triangular-pentagonal LQ factorization (precomputed via dtplqt with M=K=3, N=4, L=2, MB=2). V is K-by-M = 3-by-4 (column-major); each row contains a Householder reflector.
var V = new Float64Array([
	0.1588655408783436,
	-0.001394714282941161,
	0.03301717713255574,
	0.0680852318050044,
	0.12792683211571895,
	-0.02197766954243346,
	0.24964584995168285,
	0.027120926626969973,
	0.04211786266338832,
	0.0,
	0.18940462477028552,
	0.046858867600337285
]);
var T = new Float64Array([
	1.8311716349233826,
	0.0,
	-0.05307204182544973,
	1.8993769429346945,
	1.9889754674521143,
	0.0
]);

// Apply Q from the left to a stacked C = [A; B] with A = 3x3, B = 4x3 (both column-major).
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

// dtpmlqt.ndarray( side, trans, M, N, K, l, mb, V, sV1, sV2, oV, T, sT1, sT2, oT, A, sA1, sA2, oA, B, sB1, sB2, oB, WORK, sW, oW )
dtpmlqt( 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 1, 3, 0, T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );

console.log( A ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console
