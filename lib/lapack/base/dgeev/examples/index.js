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
import dgeev from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dgeev( 'compute-vectors', 'compute-vectors', N, A, N, WR, 1, WI, 1, VL, N, VR, N );
console.log( out );

// Using the ndarray interface:
out = dgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, WR, 1, 0, WI, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N );
console.log( out );
