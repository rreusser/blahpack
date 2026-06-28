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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import { ndarray as ztpmqrt } from './../lib/index.js';

// A small precomputed pentagonal compact-WY V and block triangular factor T

// (would normally come from `ztpqrt` with M=4, N=K=3, L=2, NB=2). Values

// Chosen for self-contained illustration; not the result of a real

// factorization.
var Vbuf = new Float64Array([
	0.16,
	0.04,
	0.04,
	-0.07,
	0.25,
	0.02,
	0.0,
	0.0,
	0.01,
	-0.01,
	0.13,
	0.09,
	0.03,
	-0.06,
	0.18,
	0.04,
	0.03,
	0.04,
	-0.01,
	-0.05,
	0.03,
	0.02,
	0.06,
	-0.07
]);
var V = new Complex128Array( Vbuf.buffer );

var Tbuf = new Float64Array([
	1.82,
	0.04,
	0.0,
	0.0,
	-0.03,
	0.02,
	1.87,
	-0.12,
	1.96,
	-0.14,
	0.0,
	0.0
]);
var T = new Complex128Array( Tbuf.buffer );

// Set up A (K-by-N = 3x3) and B (M-by-N = 4x3) in column-major order.
var Abuf = new Float64Array([
	1.0,
	0.0,
	4.0,
	0.0,
	7.0,
	0.0,
	2.0,
	0.0,
	5.0,
	0.0,
	8.0,
	0.0,
	3.0,
	0.0,
	6.0,
	0.0,
	9.0,
	0.0
]);
var A = new Complex128Array( Abuf.buffer );

var Bbuf = new Float64Array([
	1.0,
	0.0,
	0.5,
	0.0,
	-1.0,
	0.0,
	2.0,
	0.0,
	-1.0,
	0.0,
	1.5,
	0.0,
	0.0,
	0.0,
	-2.0,
	0.0,
	2.0,
	0.0,
	-2.5,
	0.0,
	3.0,
	0.0,
	1.0,
	0.0
]);
var B = new Complex128Array( Bbuf.buffer );

var WORK = new Complex128Array( 2 * 3 );

// ztpmqrt.ndarray( side, trans, M, N, K, l, nb, V, sV1, sV2, oV, T, sT1, sT2, oT, A, sA1, sA2, oA, B, sB1, sB2, oB, WORK, sW, oW )
ztpmqrt( 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 1, 4, 0, T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );

console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console
