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
import dgebrd from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dgebrd( 'row-major', N, N, A, N, d, 1, e, 1, TAUQ, 1, TAUP, 1, WORK, 1, N );
console.log( out );

// Using the ndarray interface:
out = dgebrd.ndarray( N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, N );
console.log( out );
