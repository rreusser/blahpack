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
import { ndarray as dgemlqt } from './../lib/index.js';

// Compact-WY V/T from a 3x4 LQ factorization (precomputed by dgelqt with MB=2).

// V is stored K(=3)-by-Q(=4) in column-major layout (LDV=3): rows of V hold the

// reflectors, with implicit unit diagonal in the strict upper trapezoidal part.
var V = new Float64Array([
	-16.61324772583615,
	-18.298649669036919,
	-19.984051612237689,
	0.28387723137883908,
	-1.07676380411633299,
	-2.15352760823266465,
	0.51097901648191035,
	-0.28315041538128122,
	5.42736519020835528e-16,
	0.73808080158498168,
	-0.74711977374035077,
	0.20175453560183881
]);
var T = new Float64Array([
	1.0601929265428847,
	0.0,
	0.5335273154757337,
	1.2207313528892849,
	1.9217743801841545,
	0.0
]);

// Apply Q to a 4x4 identity (yields the orthogonal factor Q itself).
var C = new Float64Array( 16 );
var WORK = new Float64Array( 4 * 2 );
C[ 0 ] = 1.0;
C[ 5 ] = 1.0;
C[ 10 ] = 1.0;
C[ 15 ] = 1.0;

// dgemlqt.ndarray( side, trans, M, N, K, mb, V, sV1, sV2, oV, T, sT1, sT2, oT, C, sC1, sC2, oC, WORK, sW, oW )
dgemlqt( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );

console.log( C ); // eslint-disable-line no-console
