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
import zlasyf from './../lib/index.js';

const N = 3;

// Complex symmetric 3-by-3 matrix (column-major, interleaved re/im; upper triangle referenced):
const A0 = [ 4.0, 1.0, 1.0, 2.0, 3.0, 0.0, 1.0, 2.0, -2.0, 1.0, 1.0, -1.0, 3.0, 0.0, 1.0, -1.0, 5.0, 2.0 ];

// Using the standard interface:
let A = new Complex128Array( A0 );
let W = new Complex128Array( N * N );
let IPIV = new Int32Array( N );
const kb = new Int32Array( 1 );
let info = zlasyf( 'column-major', 'upper', N, N, kb, A, N, IPIV, 1, W, N );
console.log( info, kb[ 0 ], A, IPIV );

// Using the strided interface:
A = new Complex128Array( A0 );
W = new Complex128Array( N * N );
IPIV = new Int32Array( N );
info = zlasyf.strided( 'upper', N, N, kb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
console.log( info, kb[ 0 ], A, IPIV );
