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
import zhetrd from './../../zhetrd/lib/index.js';
import zunmtr from './../lib/index.js';

const N = 4;

// Column-major entries of a 4-by-4 Hermitian matrix:
const data = [
	4.0, 0.0, 1.0, -1.0, 0.0, 1.0, 2.0, 0.0,
	1.0, 1.0, 5.0, 0.0, 1.0, 0.0, 0.0, -1.0,
	0.0, -1.0, 1.0, 0.0, 6.0, 0.0, 1.0, 1.0,
	2.0, 0.0, 0.0, 1.0, 1.0, -1.0, 7.0, 0.0
];

// Column-major entries of a 4-by-2 complex matrix C:
const cdata = [
	1.0, 0.0, 0.0, 1.0, 2.0, -1.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 0.0, -2.0, 3.0, 1.0
];

// Workspace large enough for the blocked algorithms (block size 32):
const WORK = new Complex128Array( ( 4 + 33 ) * 32 );
const d = new Float64Array( N );
const e = new Float64Array( N - 1 );

// Reduce A to real tridiagonal form, A = Q * T * Q^H:
const A = new Complex128Array( data );
const TAU = new Complex128Array( N - 1 );
zhetrd( 'column-major', 'upper', N, A, N, d, 1, e, 1, TAU, 1, WORK );

// Using the standard interface, overwrite C with Q^H * C:
let C = new Complex128Array( cdata );
let info = zunmtr( 'column-major', 'left', 'upper', 'conjugate-transpose', N, 2, A, N, TAU, 1, C, N, WORK );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( C, 0 ) ); // eslint-disable-line no-console

// Using the strided interface, overwrite C with Q * C:
C = new Complex128Array( cdata );
info = zunmtr.strided( 'left', 'upper', 'no-transpose', N, 2, A, 1, N, 0, TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( C, 0 ) ); // eslint-disable-line no-console
