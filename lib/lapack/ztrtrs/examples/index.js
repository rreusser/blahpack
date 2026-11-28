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
import ztrtrs from './../lib/index.js';

const N = 3;

// Column-major entries of a 3-by-3 upper triangular complex matrix:
const A = new Complex128Array( [
	2.0, 1.0, 0.0, 0.0, 0.0, 0.0,
	1.0, -1.0, 3.0, 0.0, 0.0, 0.0,
	0.0, 2.0, 1.0, 1.0, 4.0, -1.0
] );

// Column-major entries of a 3-by-1 right-hand side:
const bdata = [ 1.0, 0.0, 2.0, 1.0, 0.0, -1.0 ];

// Using the standard interface, solve A * X = B (B is overwritten by X):
let B = new Complex128Array( bdata );
let info = ztrtrs( 'column-major', 'upper', 'no-transpose', 'non-unit', N, 1, A, N, B, N );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console

// Using the strided interface, solve A^H * X = B:
B = new Complex128Array( bdata );
info = ztrtrs.strided( 'upper', 'conjugate-transpose', 'non-unit', N, 1, A, 1, N, 0, B, 1, N, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console
