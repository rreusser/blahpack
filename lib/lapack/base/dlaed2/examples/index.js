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
import dlaed2 from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};
const N = 3;
const Q = discreteUniform( N * N, -10, 10, opts );
const Q2 = discreteUniform( N * N, -10, 10, opts );
const d = discreteUniform( N, -10, 10, opts );
const INDXQ = discreteUniform( N, -10, 10, opts );
const z = discreteUniform( N, -10, 10, opts );
const DLAMBDA = discreteUniform( N, -10, 10, opts );
const w = discreteUniform( N, -10, 10, opts );
const INDX = discreteUniform( N, -10, 10, opts );
const INDXC = discreteUniform( N, -10, 10, opts );
const INDXP = discreteUniform( N, -10, 10, opts );
const COLTYP = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
let out = dlaed2( N, 1, d, Q, N, INDXQ, 1.0, z, DLAMBDA, w, Q2, INDX, INDXC, INDXP, COLTYP );
console.log( out );

// Using the ndarray interface:
out = dlaed2.ndarray( N, 1, d, 1, 0, Q, N, 1, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, N, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
console.log( out );
