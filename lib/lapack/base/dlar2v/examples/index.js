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
import dlar2v from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};
const N = 3;
const x = discreteUniform( N, -10, 10, opts );
const y = discreteUniform( N, -10, 10, opts );
const z = discreteUniform( N, -10, 10, opts );
const c = discreteUniform( N, -10, 10, opts );
const s = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
let out = dlar2v( N, x, y, z, 1, c, s, 1 );
console.log( out );

// Using the ndarray interface:
out = dlar2v.ndarray( N, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );
console.log( out );
