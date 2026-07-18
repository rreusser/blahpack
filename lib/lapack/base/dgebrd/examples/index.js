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
import dgebrd from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};
const N = 3;
const A = discreteUniform( N * N, -10, 10, opts );
const d = discreteUniform( N, -10, 10, opts );
const e = discreteUniform( N, -10, 10, opts );
const TAUQ = discreteUniform( N, -10, 10, opts );
const TAUP = discreteUniform( N, -10, 10, opts );
const WORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
let out = dgebrd( 'row-major', N, N, A, N, d, 1, e, 1, TAUQ, 1, TAUP, 1, WORK, 1, N );
console.log( out );

// Using the ndarray interface:
out = dgebrd.ndarray( N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, N );
console.log( out );
