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
import dsyevr from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var ISUPPZ = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dsyevr( 'compute-vectors', 'all', 'upper', N, A, N, 1.0, 1.0, N, N, 1.0, 1, w, 1, Z, N, ISUPPZ, 1, WORK, 1, N, IWORK, 1, 1 );
console.log( out );

// Using the ndarray interface:
out = dsyevr.ndarray( 'compute-vectors', 'all', 'upper', N, A, N, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, N, IWORK, 1, 0, 1 );
console.log( out );
