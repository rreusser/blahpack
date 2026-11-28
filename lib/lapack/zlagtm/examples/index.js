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
import zlagtm from './../lib/index.js';

const N = 3;
const nrhs = 2;

// Complex tridiagonal matrix A (sub-, main and super-diagonals):
const DL = new Complex128Array( [ 1.0, 1.0, 2.0, -1.0 ] );
const d = new Complex128Array( [ 4.0, 0.0, 5.0, 1.0, 6.0, -1.0 ] );
const DU = new Complex128Array( [ -1.0, 2.0, 1.0, 0.0 ] );

// Right-hand side matrix X (column-major, N x nrhs):
const X = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 0.0, 1.0, 1.0, 1.0, 2.0, 0.0 ] );

// Using the standard interface (B := A*X + 0*B):
let B = new Complex128Array( N * nrhs );
zlagtm( 'column-major', 'no-transpose', N, nrhs, 1.0, DL, 1, d, 1, DU, 1, X, N, 0.0, B, N );
console.log( reinterpret( B, 0 ) );

// Using the strided interface:
B = new Complex128Array( N * nrhs );
zlagtm.strided( 'no-transpose', N, nrhs, 1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, N, 0, 0.0, B, 1, N, 0 );
console.log( reinterpret( B, 0 ) );
