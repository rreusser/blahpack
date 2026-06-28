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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { ndarray as zgemlqt } from './../lib/index.js';

// Compact-WY V/T from a 3x4 complex LQ factorization (precomputed by zgelqt with MB=2).

// V is stored K(=3)-by-Q(=4) in column-major layout (LDV=3): rows of V hold the

// reflectors, with implicit unit diagonal in the strict upper trapezoidal part.
var V = new Complex128Array([
	-16.618664206247143,
	0,
	-18.28185443964808,
	-0.072207969612197,
	-19.998598917178064,
	0.24671056284167314,
	0.28368897420329414,
	-0.008896122487258908,
	-1.4382573680131832,
	0,
	-1.3949798643083664,
	-0.6635702640700667,
	0.5109493748057401,
	0.011227305471246415,
	-0.25067986562952355,
	-0.08871320519188074,
	1.5358648803989363,
	0,
	0.7376299855835411,
	-0.019724877723334106,
	-0.36233623468373793,
	0.5347078414884843,
	0.4483654834537943,
	0.6387581608269846
]);
var T = new Complex128Array([
	1.060173308010164,
	-0.012034661602032837,
	0,
	0,
	0.3256536678335645,
	0.37742626441083044,
	1.172631123192261,
	-0.44849549402089633,
	1.2109338732834616,
	0.1969745200132139,
	0,
	0
]);

// Apply Q to a 4x4 identity (yields the unitary factor Q itself).
var C = new Complex128Array( 16 );
var WORK = new Complex128Array( 4 * 2 );
C.set( [ 1.0, 0.0 ], 0 );
C.set( [ 1.0, 0.0 ], 5 );
C.set( [ 1.0, 0.0 ], 10 );
C.set( [ 1.0, 0.0 ], 15 );

// zgemlqt.ndarray( side, trans, M, N, K, mb, V, sV1, sV2, oV, T, sT1, sT2, oT, C, sC1, sC2, oC, WORK, sW, oW )
zgemlqt( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );

console.log( C ); // eslint-disable-line no-console
