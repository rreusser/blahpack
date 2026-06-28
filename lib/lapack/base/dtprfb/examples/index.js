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
import dtprfb from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};

// Pentagonal reflector dimensions: M=4, N=3, K=2, L=1.
var V = discreteUniform( 4 * 2, -1, 1, opts );
var T = discreteUniform( 2 * 2, -1, 1, opts );
var A = discreteUniform( 2 * 3, -10, 10, opts );
var B = discreteUniform( 4 * 3, -10, 10, opts );
var WORK = discreteUniform( 2 * 3, 0, 0, opts );

// Apply the pentagonal reflector from the left using the ndarray interface:
dtprfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 1, 4, 0, T, 1, 2, 0, A, 1, 2, 0, B, 1, 4, 0, WORK, 1, 2, 0 );
console.log( A );
console.log( B );
