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
import dlasd7 from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};
const N = 3;
const GIVCOL = discreteUniform( N * N, -10, 10, opts );
const GIVNUM = discreteUniform( N * N, -10, 10, opts );
const d = discreteUniform( N, -10, 10, opts );
const z = discreteUniform( N, -10, 10, opts );
const ZW = discreteUniform( N, -10, 10, opts );
const VF = discreteUniform( N, -10, 10, opts );
const VFW = discreteUniform( N, -10, 10, opts );
const VL = discreteUniform( N, -10, 10, opts );
const VLW = discreteUniform( N, -10, 10, opts );
const DSIGMA = discreteUniform( N, -10, 10, opts );
const IDX = discreteUniform( N, -10, 10, opts );
const IDXP = discreteUniform( N, -10, 10, opts );
const IDXQ = discreteUniform( N, -10, 10, opts );
const PERM = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
let out = dlasd7( 1, 1, 1, 1, d, z, ZW, VF, VFW, VL, VLW, 1.0, 1.0, DSIGMA, IDX, IDXP, IDXQ, PERM, GIVCOL, N, GIVNUM, N );
console.log( out );

// Using the ndarray interface:
out = dlasd7.ndarray( 1, 1, 1, 1, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1.0, 1.0, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, GIVCOL, N, 1, 0, GIVNUM, N, 1, 0 );
console.log( out );
