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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggev from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
let B = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const VL = new Complex128Array( N * N );
const VR = new Complex128Array( N * N );
const ALPHA = new Complex128Array( N );
const BETA = new Complex128Array( N );

// Using the standard interface (internally allocated workspaces):
let out = zggev( 'column-major', 'compute-vectors', 'compute-vectors', N, A, N, B, N, ALPHA, 1, BETA, 1, VL, N, VR, N, null, null );
console.log( out, reinterpret( ALPHA, 0 ), reinterpret( BETA, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface (caller-provided workspaces):
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
B = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const WORK = new Complex128Array( N + ( N * 32 ) + ( 33 * 32 ) );
const RWORK = new Float64Array( 8 * N );
out = zggev.ndarray( 'compute-vectors', 'compute-vectors', N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( out, reinterpret( ALPHA, 0 ), reinterpret( BETA, 0 ) ); // eslint-disable-line no-console
