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
import dlasd2 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var U = discreteUniform( N * N, -10, 10, opts );
var VT = discreteUniform( N * N, -10, 10, opts );
var U2 = discreteUniform( N * N, -10, 10, opts );
var VT2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXC = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
var out = dlasd2( 'row-major', 1, 1, 1, N, D, Z, 1.0, 1.0, U, N, VT, N, DSIGMA, U2, 1, VT2, 1, IDXP, IDX, IDXC, IDXQ, COLTYP );
console.log( out );

// Using the ndarray interface:
out = dlasd2.ndarray( 1, 1, 1, N, d, 1, 0, z, 1, 0, 1.0, 1.0, U, N, 1, 0, VT, N, 1, 0, DSIGMA, 1, 0, U2, N, 1, 0, VT2, N, 1, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
console.log( out );
