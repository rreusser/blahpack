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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrexc from './../lib/index.js';

const N = 3;

// Complex upper triangular matrix T in Schur form (column-major):
const T0 = [ 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 3.0, -1.0, 0.0, 0.0, 4.0, 1.0, 5.0, 0.0, 6.0, 2.0 ];

// Identity matrix of Schur vectors:
const Q0 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ];

// Using the standard interface (move the first diagonal element to the last row; indices are 1-based):
let T = new Complex128Array( T0 );
let Q = new Complex128Array( Q0 );
let info = ztrexc( 'column-major', 'update', N, T, N, Q, N, 1, 3 );
console.log( info, reinterpret( T, 0 ), reinterpret( Q, 0 ) );

// Using the strided interface:
T = new Complex128Array( T0 );
Q = new Complex128Array( Q0 );
info = ztrexc.strided( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 3 );
console.log( info, reinterpret( T, 0 ), reinterpret( Q, 0 ) );
