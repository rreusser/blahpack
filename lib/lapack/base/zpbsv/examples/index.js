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
import zpbsv from './../lib/index.js';

// Hermitian positive definite tridiagonal matrix A = [ 4, 1-i, 0; 1+i, 5, 2i; 0, -2i, 6 ]
// stored in upper band format (kd = 1, LDAB = 2, column-major):
const N = 3;
const kd = 1;
const LDAB = kd + 1;
const data = [ 0.0, 0.0, 4.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, 2.0, 6.0, 0.0 ];

// Right-hand side b = A * [ 1, 1, 1 ]^T:
const rhs = [ 5.0, -1.0, 6.0, 3.0, 6.0, -2.0 ];

// Using the standard interface (solve A * X = B):
let AB = new Complex128Array( data );
let B = new Complex128Array( rhs );
let info = zpbsv( 'column-major', 'upper', N, kd, 1, AB, LDAB, B, N );
console.log( info );
// => 0
console.log( reinterpret( B, 0 ) );
// => <Float64Array>[ ~1, ~0, ~1, ~0, ~1, ~0 ]

// Using the ndarray interface:
AB = new Complex128Array( data );
B = new Complex128Array( rhs );
info = zpbsv.ndarray( 'upper', N, kd, 1, AB, 1, LDAB, 0, B, 1, N, 0 );
console.log( info );
// => 0
console.log( reinterpret( B, 0 ) );
