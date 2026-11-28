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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhesv from './../lib/index.js';

const N = 3;
const nrhs = 1;
// 3x3 Hermitian matrix (column-major, interleaved real/imaginary parts):
const Avals = [ 4.0, 0.0, 1.0, 2.0, 3.0, -1.0, 1.0, -2.0, -3.0, 0.0, 2.0, 1.0, 3.0, 1.0, 2.0, -1.0, 5.0, 0.0 ];
// Right-hand side (3x1):
const Bvals = [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0 ];

// Using the standard interface:
let A = new Complex128Array( Avals );
let B = new Complex128Array( Bvals );
let IPIV = new Int32Array( N );
let WORK = new Complex128Array( N );
let info = zhesv( 'column-major', 'upper', N, nrhs, A, N, IPIV, 1, B, N, WORK );
console.log( info );
console.log( reinterpret( B, 0 ) );

// Using the ndarray interface:
A = new Complex128Array( Avals );
B = new Complex128Array( Bvals );
IPIV = new Int32Array( N );
WORK = new Complex128Array( N );
info = zhesv.ndarray( 'upper', N, nrhs, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, WORK, 1, 0 );
console.log( info );
console.log( reinterpret( B, 0 ) );
