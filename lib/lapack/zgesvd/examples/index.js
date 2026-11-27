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
import zgesvd from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const U = new Complex128Array( N * N );
const VT = new Complex128Array( N * N );
const s = new Float64Array( N );

// Using the standard interface (internally allocated workspaces):
let out = zgesvd( 'column-major', 'all-columns', 'all-rows', N, N, A, N, s, 1, U, N, VT, N, null, null );
console.log( out, s ); // eslint-disable-line no-console

// Using the ndarray interface (caller-provided workspaces; a 3-by-3 matrix needs at least 21 complex elements of WORK and 5*N elements of RWORK):
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const WORK = new Complex128Array( 64 );
const RWORK = new Float64Array( 5 * N );
out = zgesvd.ndarray( 'all-columns', 'all-rows', N, N, A, 1, N, 0, s, 1, 0, U, 1, N, 0, VT, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( out, s ); // eslint-disable-line no-console
