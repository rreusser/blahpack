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
import zgbtrs from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = zgbtrs( 'row-major', 'no-transpose', N, N, N, N, AB, N, IPIV, 1, B, N );
console.log( out );

// Using the ndarray interface:
out = zgbtrs.ndarray( 'no-transpose', N, N, N, N, AB, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
console.log( out );
