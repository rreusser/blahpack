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
import { ndarray as dgemqrt } from './../lib/index.js';

// Compact-WY V/T from a 4x3 QR factorization (precomputed by dgeqrt with NB=2).
var V = new Float64Array([
	-5.477225575051661,
	0.30877417758976965,
	0.4631612663846545,
	0.6175483551795394,
	-12.78019300845387,
	-3.265986323710909,
	-0.32709805959407564,
	-0.7892453989841912,
	-20.08316044185609,
	-6.531972647421816,
	4.237966580952926e-15,
	0.6342438504900516
]);
var T = new Float64Array([
	1.1825741858350554,
	0.0,
	0.4513482092576147,
	1.156135230183046,
	1.4262636709065167,
	0.0
]);

// Apply Q to a 4x4 identity (yields the orthogonal factor Q itself).
var C = new Float64Array( 16 );
var WORK = new Float64Array( 4 * 2 );
C[ 0 ] = 1.0;
C[ 5 ] = 1.0;
C[ 10 ] = 1.0;
C[ 15 ] = 1.0;

// dgemqrt.ndarray( side, trans, M, N, K, nb, V, sV1, sV2, oV, T, sT1, sT2, oT, C, sC1, sC2, oC, WORK, sW, oW )
dgemqrt( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );

console.log( C ); // eslint-disable-line no-console
