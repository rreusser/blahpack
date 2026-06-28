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
import dtgsja from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dtgsja( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, N, 1, A, N, B, N, 1, 1, ALPHA, 1, BETA, 1, U, N, V, N, Q, N, WORK, 1, 1 );
console.log( out );

// Using the ndarray interface:
out = dtgsja.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, N, 1, A, N, 1, 0, B, N, 1, 0, 1, 1, ALPHA, 1, 0, BETA, 1, 0, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, WORK, 1, 0, 1 );
console.log( out );
