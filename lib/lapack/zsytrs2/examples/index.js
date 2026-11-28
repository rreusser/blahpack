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
import zsytf2 from './../../zsytf2/lib/index.js';
import zsytrs2 from './../lib/index.js';

const N = 3;
const nrhs = 1;
const WORK = new Complex128Array( N );

// Factor the complex symmetric matrix A (column-major) with zsytf2:
const A = new Complex128Array( [ 1.0, 1.0, 2.0, 0.0, 3.0, 0.0, 2.0, 0.0, -4.0, 0.0, 5.0, -1.0, 3.0, 0.0, 5.0, -1.0, 6.0, 0.0 ] );
const IPIV = new Int32Array( N );
zsytf2( 'column-major', 'upper', N, A, N, IPIV, 1 );

// Solve A*X = B, where B = A * [ 1, 1, 1 ]^T, using the standard interface:
let B = new Complex128Array( [ 6.0, 1.0, 3.0, -1.0, 14.0, -1.0 ] );
let info = zsytrs2( 'column-major', 'upper', N, nrhs, A, N, IPIV, 1, B, N, WORK );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
B = new Complex128Array( [ 6.0, 1.0, 3.0, -1.0, 14.0, -1.0 ] );
info = zsytrs2.ndarray( 'upper', N, nrhs, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, WORK, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console
