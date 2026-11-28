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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtrsen from './../lib/index.js';

const N = 3;

// Upper triangular matrix T in Schur canonical form (column-major):
const T0 = [ 1.0, 0.0, 0.0, 2.0, 3.0, 0.0, 4.0, 5.0, 6.0 ];

// Identity matrix of Schur vectors:
const Q0 = [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ];

// Select the last eigenvalue to move to the leading position:
const SELECT = new Uint8Array( [ 0, 0, 1 ] );
const WR = new Float64Array( N );
const WI = new Float64Array( N );
const M = new Int32Array( 1 );
const s = new Float64Array( 1 );
const sep = new Float64Array( 1 );
const WORK = new Float64Array( N * N );
const IWORK = new Int32Array( N * N );

// Using the standard interface:
let T = new Float64Array( T0 );
let Q = new Float64Array( Q0 );
let info = dtrsen( 'column-major', 'both', 'update', SELECT, 1, N, T, N, Q, N, WR, 1, WI, 1, M, s, sep, WORK, IWORK );
console.log( info, M[ 0 ], s[ 0 ], sep[ 0 ], WR );

// Using the strided interface:
T = new Float64Array( T0 );
Q = new Float64Array( Q0 );
info = dtrsen.strided( 'both', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, M[ 0 ], s[ 0 ], sep[ 0 ], WR );
