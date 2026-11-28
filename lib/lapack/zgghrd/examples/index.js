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

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgghrd from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;

// B must be upper triangular (column-major, interleaved re/im):
const B0 = [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 3.0, 0.0, 0.0, 0.0, 1.0, -1.0, 2.0, 1.0, 4.0, 0.0 ];

// Using the standard interface (reduce (A,B) to Hessenberg-triangular form):
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
let B = new Complex128Array( B0 );
let Q = new Complex128Array( N * N );
let Z = new Complex128Array( N * N );
let out = zgghrd( 'column-major', 'initialize', 'initialize', N, 1, N, A, N, B, N, Q, N, Z, N );
console.log( out, reinterpret( A, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
B = new Complex128Array( B0 );
Q = new Complex128Array( N * N );
Z = new Complex128Array( N * N );
out = zgghrd.strided( 'initialize', 'initialize', N, 1, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0 );
console.log( out, reinterpret( A, 0 ) ); // eslint-disable-line no-console
