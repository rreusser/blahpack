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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatrd from './../lib/index.js';

const N = 3;
const nb = 2;

// Hermitian 3-by-3 matrix (row-major, interleaved re/im; upper triangle referenced):
const A0 = [ 4.0, 0.0, 1.0, 1.0, 2.0, -1.0, 1.0, -1.0, 5.0, 0.0, 1.0, 2.0, 2.0, 1.0, 1.0, -2.0, 6.0, 0.0 ];

// Using the standard interface (reduces the last `nb` rows and columns to tridiagonal form):
let A = new Complex128Array( A0 );
let e = new Float64Array( N - 1 );
let TAU = new Complex128Array( N - 1 );
let W = new Complex128Array( N * nb );
zlatrd( 'row-major', 'upper', N, nb, A, N, e, 1, TAU, 1, W, nb );
console.log( e );

// Using the ndarray interface:
A = new Complex128Array( A0 );
e = new Float64Array( N - 1 );
TAU = new Complex128Array( N - 1 );
W = new Complex128Array( N * nb );
zlatrd.ndarray( 'upper', N, nb, A, N, 1, 0, e, 1, 0, TAU, 1, 0, W, nb, 1, 0 );
console.log( e );
