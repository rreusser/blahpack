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
import zgtcon from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = zgtcon( '1', N, DL, 1, d, 1, DU, 1, 1, 1, IPIV, 1, 1.0, 1.0, WORK, 1 );
console.log( out );

// Using the ndarray interface:
out = zgtcon.ndarray( '1', N, DL, 1, 0, d, 1, 0, DU, 1, 0, 1, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0 );
console.log( out );
