/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
import dlaqr5 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var WH = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dlaqr5( 1, 1, 1, 1, 1, 1 );
console.log( out );

// Using the ndarray interface:
out = dlaqr5.ndarray( 1, 1, 1, N, 1, 1, 1, SR, 1, 0, SI, 1, 0, H, N, 1, 0, 1, 1, Z, N, 1, 0, V, N, 1, 0, U, N, 1, 0, 1, WV, N, 1, 0, 1, WH, N, 1, 0 );
console.log( out );
