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
import zlarfb from './../lib/index.js';

const M = 4;
const N = 3;
const K = 2;

// M-by-K matrix of reflector vectors (unit lower trapezoidal, column-major):
const V = new Complex128Array( [ 1.0, 0.0, 0.5, -0.5, -0.25, 0.75, 0.1, 0.2, 0.0, 0.0, 1.0, 0.0, 0.3, -0.4, -0.6, 0.1 ] );

// K-by-K upper triangular block reflector factor (column-major):
const T = new Complex128Array( [ 1.2, -0.3, 0.0, 0.0, -0.4, 0.2, 1.5, 0.1 ] );

// M-by-N matrix (column-major) and N-by-K workspace:
let C = new Complex128Array( [ 1.0, 2.0, 3.0, -1.0, 0.5, 0.0, -2.0, 1.0, 4.0, 0.5, 1.0, -1.5, 0.0, 3.0, 2.0, 2.0, -1.0, -1.0, 1.5, 0.5, 2.5, -0.5, 1.0, 1.0 ] );
const WORK = new Complex128Array( N * K );

// Using the standard interface (C := H * C):
zlarfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', M, N, K, V, M, T, K, C, M, WORK, N );
console.log( reinterpret( C, 0 ) );

// Using the ndarray interface:
C = new Complex128Array( [ 1.0, 2.0, 3.0, -1.0, 0.5, 0.0, -2.0, 1.0, 4.0, 0.5, 1.0, -1.5, 0.0, 3.0, 2.0, 2.0, -1.0, -1.0, 1.5, 0.5, 2.5, -0.5, 1.0, 1.0 ] );
zlarfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', M, N, K, V, 1, M, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, N, 0 );
console.log( reinterpret( C, 0 ) );
