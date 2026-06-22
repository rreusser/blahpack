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
import dlaebz from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var AB = discreteUniform( N * N, -10, 10, opts );
var NAB = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var NVAL = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dlaebz( 1, 1, N, 1, 1, 1, 1.0, 1, 1.0, d, 1, e, 1, 1, 1, NVAL, 1, AB, N, c, 1, 1, NAB, N, WORK, 1, IWORK, 1 );
console.log( out );

// Using the ndarray interface:
out = dlaebz.ndarray( 1, 1, N, 1, 1, 1, 1.0, 1, 1.0, d, 1, 0, e, 1, 0, 1, 1, 0, NVAL, 1, 0, AB, N, 1, 0, c, 1, 0, 1, NAB, N, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( out );
