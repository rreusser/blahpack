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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeev from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const VL = new Complex128Array( N * N );
const VR = new Complex128Array( N * N );
const w = new Complex128Array( N );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( 2 * N );

// Using the standard interface:
let out = zgeev( 'column-major', 'compute-vectors', 'compute-vectors', N, A, N, w, 1, VL, N, VR, N, WORK, RWORK );
console.log( out );

// Using the ndarray interface:
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
out = zgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, w, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( out );
