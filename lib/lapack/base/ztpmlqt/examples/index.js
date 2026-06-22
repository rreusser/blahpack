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
import { ndarray as ztpmlqt } from './../lib/index.js';

// Compact-WY pentagonal V/T from a triangular-pentagonal LQ factorization (precomputed via ztplqt with M=K=3, N=4, L=2, MB=2). V is K-by-M = 3-by-4 (column-major); each row contains an elementary reflector.
var V = new Complex128Array([
	0.15753239821384019,
	-0.02614750668668203,
	0.005739080792691196,
	0.06557731587808395,
	0.023373513590656186,
	-0.039328939552060134,
	0.06875246359473117,
	0.0436249628517665,
	0.12262687505085741,
	-0.024040260084618258,
	-0.01709923831765856,
	0.05856623100609984,
	0.24937235066410135,
	0.03954493907689706,
	0.024305590584232446,
	-0.03426863560665007,
	0.04435396135166497,
	0.04576865805220344,
	0.0,
	0.0,
	0.18840184996118095,
	0.006814729760804713,
	0.04870086607520375,
	-0.005608358725706756
]);
var T = new Complex128Array([
	1.8240856434303292,
	-0.04120428217151646,
	0.0,
	0.0,
	-0.040232111089394916,
	-0.018031620325958526,
	1.8875173569907717,
	-0.08875173569907714,
	1.9745340255651158,
	0.04872670127825579,
	0.0,
	0.0
]);

// Apply Q from the left to a stacked C = [A; B] with A = 3x3, B = 4x3 (both column-major, complex).
var A = new Complex128Array([
	1.0,
	0.1,
	4.0,
	-0.1,
	7.0,
	0.4,
	2.0,
	-0.2,
	5.0,
	0.2,
	8.0,
	-0.4,
	3.0,
	0.3,
	6.0,
	-0.3,
	9.0,
	0.0
]);
var B = new Complex128Array([
	1.0,
	0.2,
	0.5,
	-0.3,
	-1.0,
	0.0,
	2.0,
	0.3,
	-1.0,
	0.1,
	1.5,
	-0.2,
	0.0,
	0.5,
	-2.0,
	-0.4,
	2.0,
	-0.1,
	-2.5,
	0.4,
	3.0,
	-0.1,
	1.0,
	0.2
]);
var WORK = new Complex128Array( 3 * 2 );

// ztpmlqt.ndarray( side, trans, M, N, K, l, mb, V, sV1, sV2, oV, T, sT1, sT2, oT, A, sA1, sA2, oA, B, sB1, sB2, oB, WORK, sW, oW )
ztpmlqt( 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 1, 3, 0, T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );

console.log( A ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console
