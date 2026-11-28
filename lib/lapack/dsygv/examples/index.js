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
import dsygv from './../lib/index.js';

// Generalized symmetric-definite eigenproblem A*x = lambda*B*x (itype = 1),
// with A symmetric and B symmetric positive definite (column-major):
const N = 3;
const dataA = [ 4.0, 1.0, 2.0, 1.0, 3.0, 0.5, 2.0, 0.5, 5.0 ];
const dataB = [ 2.0, 0.5, 0.0, 0.5, 2.0, 0.5, 0.0, 0.5, 2.0 ];
let A = new Float64Array( dataA );
let B = new Float64Array( dataB );
const w = new Float64Array( N );
const WORK = new Float64Array( 3 * N );

// Using the standard interface:
let info = dsygv( 'column-major', 1, 'compute-vectors', 'upper', N, A, N, B, N, w, 1, WORK );
console.log( info, w, A );

// Using the strided interface:
A = new Float64Array( dataA );
B = new Float64Array( dataB );
info = dsygv.strided( 1, 'compute-vectors', 'upper', N, A, 1, N, 0, B, 1, N, 0, w, 1, 0, WORK, 1, 0 );
console.log( info, w, A );
