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
import dggsvp3 from './../lib/index.js';

// Preprocess the matrix pair (A, B) for the generalized SVD (column-major, 3x3):
const M = 3;
const p = 3;
const N = 3;
const tola = 1e-8;
const tolb = 1e-8;

let A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
let B = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 1.0, 1.0, 1.0, 1.0, 3.0 ] );
const K = new Int32Array( 1 );
const l = new Int32Array( 1 );
const U = new Float64Array( M * M );
const V = new Float64Array( p * p );
const Q = new Float64Array( N * N );
const IWORK = new Int32Array( N );
const TAU = new Float64Array( N );
const WORK = new Float64Array( 4 * N );

// Using the standard interface:
let info = dggsvp3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', M, p, N, A, M, B, p, tola, tolb, K, l, U, M, V, p, Q, N, IWORK, TAU, 1, WORK );
console.log( 'info: %d, K: %d, L: %d', info, K[ 0 ], l[ 0 ] );

// Using the strided interface:
A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
B = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 1.0, 1.0, 1.0, 1.0, 3.0 ] );
info = dggsvp3.strided( 'compute-U', 'compute-V', 'compute-Q', M, p, N, A, 1, M, 0, B, 1, p, 0, tola, tolb, K, l, U, 1, M, 0, V, 1, p, 0, Q, 1, N, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );
console.log( 'info: %d, K: %d, L: %d', info, K[ 0 ], l[ 0 ] );
