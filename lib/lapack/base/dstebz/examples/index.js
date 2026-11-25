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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstebz from './../lib/index.js';

// Symmetric tridiagonal matrix with diagonal `d` and off-diagonal `e`:
const N = 4;
const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
const e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
const M = new Int32Array( 1 );
const nsplit = new Int32Array( 1 );
const w = new Float64Array( N );
const IBLOCK = new Int32Array( N );
const ISPLIT = new Int32Array( N );
const WORK = new Float64Array( 4 * N );
const IWORK = new Int32Array( 3 * N );

// Using the standard interface:
let info = dstebz( 'all', 'entire', N, 0.0, 0.0, 1, N, 0.0, d, 1, e, 1, M, nsplit, w, 1, IBLOCK, 1, ISPLIT, 1, WORK, IWORK );
console.log( info, M[ 0 ], w );

// Using the ndarray interface:
info = dstebz.ndarray( 'all', 'entire', N, 0.0, 0.0, 1, N, 0.0, d, 1, 0, e, 1, 0, M, nsplit, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, M[ 0 ], w );
