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
import dstevr from './../lib/index.js';

// Symmetric tridiagonal matrix with diagonal `d` and subdiagonal `e`:
const N = 3;
let d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
let e = new Float64Array( [ 1.0, 1.0 ] );
const M = new Int32Array( 1 );
const w = new Float64Array( N );
let Z = new Float64Array( N * N );
const ISUPPZ = new Int32Array( 2 * N );
const WORK = new Float64Array( 20 * N );
const IWORK = new Int32Array( 10 * N );

// Using the standard interface:
let info = dstevr( 'column-major', 'compute-vectors', 'all', N, d, 1, e, 1, 0.0, 0.0, 1, N, 0.0, M, w, 1, Z, N, ISUPPZ, 1, WORK, IWORK );
console.log( info, M[ 0 ], w, Z );

// Using the strided interface:
d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
e = new Float64Array( [ 1.0, 1.0 ] );
Z = new Float64Array( N * N );
info = dstevr.strided( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 0.0, 0.0, 1, N, 0.0, M, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, M[ 0 ], w, Z );
