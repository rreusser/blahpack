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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpttrf from './../../zpttrf/lib/index.js';
import zpttrs from './../lib/index.js';

// Hermitian positive definite tridiagonal matrix A = [ 4, 1-i, 0; 1+i, 5, 2i; 0, -2i, 6 ]
// (diagonal `d` and subdiagonal `e`):
const N = 3;
const d = new Float64Array( [ 4.0, 5.0, 6.0 ] );
const e = new Complex128Array( [ 1.0, 1.0, 0.0, -2.0 ] );

// Factor A = L * D * L^H:
zpttrf( N, d, 1, e, 1 );

// Right-hand side b = A * [ 1, 1, 1 ]^T:
const rhs = [ 5.0, -1.0, 6.0, 3.0, 6.0, -2.0 ];

// Using the standard interface (solve A * X = B using the factorization):
let B = new Complex128Array( rhs );
let info = zpttrs( 'column-major', 'lower', N, 1, d, 1, e, 1, B, N );
console.log( info );
// => 0
console.log( reinterpret( B, 0 ) );
// => <Float64Array>[ ~1, ~0, ~1, ~0, ~1, ~0 ]

// Using the strided interface:
B = new Complex128Array( rhs );
info = zpttrs.strided( 'lower', N, 1, d, 1, 0, e, 1, 0, B, 1, N, 0 );
console.log( info );
// => 0
console.log( reinterpret( B, 0 ) );
