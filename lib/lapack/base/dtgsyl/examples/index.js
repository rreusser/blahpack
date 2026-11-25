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
import dtgsyl from './../lib/index.js';

// Upper triangular 3-by-3 matrices (column-major) whose pencils (A,D) and (B,E) have disjoint spectra:
const N = 3;
const A = new Float64Array( [ 4.0, 0.0, 0.0, 1.0, 5.0, 0.0, 2.0, 1.0, 6.0 ] );
const B = new Float64Array( [ 7.0, 0.0, 0.0, 1.0, 8.0, 0.0, 1.0, 2.0, 9.0 ] );
const D = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 1.0, 2.0 ] );
const E = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0 ] );

// Right-hand sides:
const C0 = [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ];
const F0 = [ 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0 ];
const scale = new Float64Array( 1 );
const dif = new Float64Array( 1 );
const WORK = new Float64Array( 2 * N * N );
const IWORK = new Int32Array( N + N + 6 );

// Using the standard interface (solve and estimate Dif):
let C = new Float64Array( C0 );
let F = new Float64Array( F0 );
let info = dtgsyl( 'column-major', 'no-transpose', 1, N, N, A, N, B, N, C, N, D, N, E, N, F, N, scale, dif, WORK, IWORK );
console.log( info, scale[ 0 ], dif[ 0 ], C, F );

// Using the ndarray interface:
C = new Float64Array( C0 );
F = new Float64Array( F0 );
info = dtgsyl.ndarray( 'no-transpose', 1, N, N, A, 1, N, 0, B, 1, N, 0, C, 1, N, 0, D, 1, N, 0, E, 1, N, 0, F, 1, N, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, scale[ 0 ], dif[ 0 ], C, F );
