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
import dlaed2 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var Q = discreteUniform( N * N, -10, 10, opts );
var Q2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var INDXQ = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DLAMBDA = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var INDX = discreteUniform( N, -10, 10, opts );
var INDXC = discreteUniform( N, -10, 10, opts );
var INDXP = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dlaed2( N, 1, d, Q, N, INDXQ, 1.0, z, DLAMBDA, w, Q2, INDX, INDXC, INDXP, COLTYP );
console.log( out );

// Using the ndarray interface:
out = dlaed2.ndarray( N, 1, d, 1, 0, Q, N, 1, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, N, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
console.log( out );
