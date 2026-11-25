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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dggsvd3 from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
let A = discreteUniform( N * N, -10, 10, opts );
let B = discreteUniform( N * N, -10, 10, opts );
const U = new Float64Array( N * N );
const V = new Float64Array( N * N );
const Q = new Float64Array( N * N );
const ALPHA = new Float64Array( N );
const BETA = new Float64Array( N );
const K = new Int32Array( 1 );
const L = new Int32Array( 1 );

// Caller-provided workspaces (the generous WORK size covers the subroutines' needs):
const WORK = new Float64Array( 256 );
const IWORK = new Int32Array( N );

// Using the standard interface:
let out = dggsvd3( 'column-major', 'compute-U', 'compute-V', 'compute-Q', N, N, N, K, L, A, N, B, N, ALPHA, 1, BETA, 1, U, N, V, N, Q, N, WORK, IWORK );
console.log( out, K[ 0 ], L[ 0 ], ALPHA, BETA ); // eslint-disable-line no-console

// Using the ndarray interface:
A = discreteUniform( N * N, -10, 10, opts );
B = discreteUniform( N * N, -10, 10, opts );
out = dggsvd3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, N, N, K, L, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, U, 1, N, 0, V, 1, N, 0, Q, 1, N, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( out, K[ 0 ], L[ 0 ], ALPHA, BETA ); // eslint-disable-line no-console
