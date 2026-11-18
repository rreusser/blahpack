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
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import zgels from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};
const M = 4;
const N = 3;
const nrhs = 2;

// B is max(M,N)-by-nrhs (column-major, leading dimension M):
let A = new Complex128Array( discreteUniform( 2 * M * N, -10, 10, opts ) );
let B = new Complex128Array( discreteUniform( 2 * M * nrhs, -10, 10, opts ) );

// Using the standard interface (workspace allocated internally):
let out = zgels( 'column-major', 'no-transpose', M, N, nrhs, A, M, B, M, null );
console.log( out );

// Using the ndarray interface with a caller-owned workspace:
A = new Complex128Array( discreteUniform( 2 * M * N, -10, 10, opts ) );
B = new Complex128Array( discreteUniform( 2 * M * nrhs, -10, 10, opts ) );
const WORK = new Complex128Array( N + ( Math.max( N, nrhs ) * 32 ) );
out = zgels.ndarray( 'no-transpose', M, N, nrhs, A, 1, M, 0, B, 1, M, 0, WORK, 1, 0 );
console.log( out );
