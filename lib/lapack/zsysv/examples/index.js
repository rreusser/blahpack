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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsysv from './../lib/index.js';

// Solve A*X = B for a column-major complex symmetric 3x3 matrix A (upper triangle referenced):
const N = 3;
const NRHS = 1;
const dataA = [ 4.0, 1.0, 1.0, 0.0, 2.0, -1.0, 1.0, 0.0, 5.0, 0.5, 1.0, 0.0, 2.0, -1.0, 1.0, 0.0, 6.0, 2.0 ];
const dataB = [ 7.0, 0.0, 7.0, 1.0, 9.0, -1.0 ];
let A = new Complex128Array( dataA );
let B = new Complex128Array( dataB );
const IPIV = new Int32Array( N );
const WORK = new Complex128Array( N );

// Using the standard interface:
let info = zsysv( 'column-major', 'upper', N, NRHS, A, N, IPIV, 1, B, N, WORK );
console.log( info, B );

// Using the strided interface:
A = new Complex128Array( dataA );
B = new Complex128Array( dataB );
info = zsysv.strided( 'upper', N, NRHS, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, WORK, 1, 0 );
console.log( info, B );
