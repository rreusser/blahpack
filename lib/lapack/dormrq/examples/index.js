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
import dgerqf from './../../dgerqf/lib/index.js';
import dormrq from './../lib/index.js';

const N = 4;

// Symmetric 4-by-4 matrix (column-major):
const A = new Float64Array( [ 4.0, 1.0, 2.0, 3.0, 1.0, 5.0, 1.0, 2.0, 2.0, 1.0, 6.0, 1.0, 3.0, 2.0, 1.0, 7.0 ] );

// Workspace large enough for the blocked algorithms (block size 32):
const WORK = new Float64Array( ( N + 33 ) * 32 );

// Compute the RQ factorization of `A`, storing the reflectors defining Q in `A` and `TAU`:
const TAU = new Float64Array( N );
dgerqf( 'column-major', N, N, A, N, TAU, 1, WORK );

// Using the standard interface (overwrites C = I with Q*C = Q):
let C = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] );
let info = dormrq( 'column-major', 'left', 'no-transpose', N, N, N, A, N, TAU, 1, C, N, WORK );
console.log( info, C );

// Using the strided interface:
C = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] );
info = dormrq.strided( 'left', 'no-transpose', N, N, N, A, 1, N, 0, TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
console.log( info, C );
