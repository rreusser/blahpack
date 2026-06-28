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
import dsyswapr from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 4;
var A = discreteUniform( N * N, -10, 10, opts );

// Swap rows/columns 0 and 2 of the symmetric matrix stored in the upper triangle:
dsyswapr( 'column-major', 'upper', N, A, N, 0, 2 );
console.log( A ); // eslint-disable-line no-console
