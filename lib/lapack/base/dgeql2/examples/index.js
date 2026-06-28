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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeql2 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var M = 3;
var N = 3;
var A = discreteUniform( M * N, -10, 10, opts );
var TAU = new Float64Array( Math.min( M, N ) );
var WORK = new Float64Array( N );

// Compute the QL factorization (column-major):
var info = dgeql2( 'column-major', M, N, A, M, TAU, 1, WORK, 1 );
console.log( info );
console.log( A );
console.log( TAU );
