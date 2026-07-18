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
import dlahr2 from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};
const N = 3;
const A = discreteUniform( N * N, -10, 10, opts );
const tau = discreteUniform( N, -10, 10, opts );
const T = discreteUniform( N, -10, 10, opts );
const Y = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
let out = dlahr2( 'row-major', N, N, N, A, N, tau, 1, t, 1, 1, y, 1, 1 );
console.log( out );

// Using the ndarray interface:
out = dlahr2.ndarray( N, N, N, A, N, 1, 0, tau, 1, 0, T, 1, 1, 0, Y, 1, 1, 0 );
console.log( out );
