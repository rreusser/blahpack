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
import zgttrf from './../../zgttrf/lib/index.js';
import zgtts2 from './../lib/index.js';

// Complex tridiagonal matrix A (N = 4); the right-hand side is b = A*[1,2,3,4]:
const N = 4;
const nrhs = 1;
const DL = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
const d = new Complex128Array( [ 4.0, 0.0, 4.0, 0.0, 4.0, 0.0, 4.0, 0.0 ] );
const DU = new Complex128Array( [ 1.0, -1.0, 1.0, -1.0, 1.0, -1.0 ] );
const DU2 = new Complex128Array( N - 2 );
const IPIV = new Int32Array( N );

// Compute the LU factorization of A:
zgttrf( N, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1 );

// Using the standard interface:
let B = new Complex128Array( [ 6.0, -2.0, 12.0, -2.0, 18.0, -2.0, 19.0, 3.0 ] );
zgtts2( 'column-major', 0, N, nrhs, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1, B, N );
console.log( 'X:', reinterpret( B, 0 ) );

// Using the strided interface:
B = new Complex128Array( [ 6.0, -2.0, 12.0, -2.0, 18.0, -2.0, 19.0, 3.0 ] );
zgtts2.strided( 0, N, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, N, 0 );
console.log( 'X:', reinterpret( B, 0 ) );
