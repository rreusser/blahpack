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
import zgelqt from './../lib/index.js';

const M = 4;
const N = 6;
const mb = 2;
const k = ( M < N ) ? M : N;

// Column-major M-by-N input matrix (interleaved real/imaginary entries):
const A = new Complex128Array([
	3.0,
	0.1,
	0.5,
	-0.3,
	0.2,
	0.5,
	0.4,
	-0.1,
	0.6,
	-0.2,
	4.0,
	0.4,
	0.5,
	-0.3,
	0.3,
	0.4,
	0.4,
	0.3,
	0.7,
	-0.2,
	3.5,
	0.2,
	0.5,
	-0.5,
	0.2,
	-0.1,
	0.3,
	0.5,
	0.8,
	-0.4,
	4.5,
	0.3,
	0.1,
	0.4,
	-0.2,
	-0.4,
	0.6,
	0.1,
	1.1,
	-0.2,
	-0.3,
	0.2,
	0.5,
	0.1,
	0.1,
	-0.5,
	-0.5,
	0.4
]);

// mb-by-K block triangular factor (output):
const T = new Complex128Array( mb * k );

// Workspace:
const WORK = new Complex128Array( mb * N );

const info = zgelqt( 'column-major', M, N, mb, A, M, T, mb, WORK );

console.log( 'info = %d', info );
console.log( A );
console.log( T );
