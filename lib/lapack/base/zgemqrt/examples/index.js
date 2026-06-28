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
import { ndarray as zgemqrt } from './../lib/index.js';

// Allocate placeholder V (4x3) and T (2x3) compact-WY factors. In practice these come from a prior call to zgeqrt.
var V = new Complex128Array( 12 );
var T = new Complex128Array( 6 );

// Apply Q to a 4x4 identity (yields the unitary factor Q itself when V/T are populated).
var C = new Complex128Array( 16 );
var WORK = new Complex128Array( 4 * 2 );

// zgemqrt.ndarray( side, trans, M, N, K, nb, V, sV1, sV2, oV, T, sT1, sT2, oT, C, sC1, sC2, oC, WORK, sW, oW )
zgemqrt( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );

console.log( C ); // eslint-disable-line no-console
