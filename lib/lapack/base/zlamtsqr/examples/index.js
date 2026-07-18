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
import zlamtsqr from './../lib/index.js';

// Apply Q^H * C with a single-block compact-WY representation (MB > M defers to zgemqrt). A and T must come from a prior zlatsqr factorization; this example uses zero matrices and only demonstrates the calling convention.
const M = 3;
const N = 2;
const K = 2;
const MB = 8;
const NB = 1;

const A = new Complex128Array( M * K );
const T = new Complex128Array( NB * K );
const C = new Complex128Array( M * N );
const WORK = new Complex128Array( N * NB );

const info = zlamtsqr( 'column-major', 'left', 'conjugate-transpose', M, N, K, MB, NB, A, M, T, NB, C, M, WORK, 1, WORK.length );
console.log( 'info=' + info ); // eslint-disable-line no-console
console.log( C ); // eslint-disable-line no-console
