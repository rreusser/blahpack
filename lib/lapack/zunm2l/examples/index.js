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
import zgeqlf from './../../zgeqlf/lib/index.js';
import zunm2l from './../lib/index.js';

const M = 4;
const N = 3;
const K = 3;

// Column-major entries of a 4-by-3 complex matrix:
const data = [
	2.0, 1.0, 1.0, 0.0, 0.0, -1.0, 1.0, 2.0,
	1.0, -1.0, 3.0, 0.0, 2.0, 1.0, 0.0, 1.0,
	0.0, 2.0, 1.0, 1.0, 4.0, 0.0, -1.0, 0.0
];

// Column-major entries of a 4-by-2 complex matrix C:
const cdata = [
	1.0, 0.0, 0.0, 1.0, 2.0, -1.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 0.0, -2.0, 3.0, 1.0
];

// Workspace large enough for the blocked algorithms (block size 32):
const WORK = new Complex128Array( ( 4 + 33 ) * 32 );

// Compute the QL factorization, which stores Q as 3 elementary reflectors:
const A = new Complex128Array( data );
const TAU = new Complex128Array( K );
zgeqlf( 'column-major', M, N, A, M, TAU, 1, WORK );

// Using the standard interface, overwrite C with Q^H * C:
let C = new Complex128Array( cdata );
let info = zunm2l( 'column-major', 'left', 'conjugate-transpose', 4, 2, K, A, M, TAU, 1, C, 4, WORK );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( C, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface, overwrite C with Q * C:
C = new Complex128Array( cdata );
info = zunm2l.ndarray( 'left', 'no-transpose', 4, 2, K, A, 1, M, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( C, 0 ) ); // eslint-disable-line no-console
