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
import dlacn2 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var v = discreteUniform( N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var ISGN = discreteUniform( N, -10, 10, opts );
var ISAVE = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dlacn2( N, v, 1, x, 1, ISGN, 1, 1, 1, ISAVE, 1 );
console.log( out );

// Using the ndarray interface:
out = dlacn2.ndarray( N, v, 1, 0, x, 1, 0, ISGN, 1, 0, 1, 1, ISAVE, 1, 0 );
console.log( out );
