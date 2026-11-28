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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgeqp3 from './../lib/index.js';
import { computeWorkSize } from './../lib/base.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const JPVT = new Int32Array( N );
const TAU = new Complex128Array( N );
const WORK = new Complex128Array( computeWorkSize( N, N ) );
const RWORK = new Float64Array( 2 * N );

// Using the standard interface:
let out = zgeqp3( 'row-major', N, N, A, N, JPVT, 1, TAU, 1, null, null );
console.log( out, JPVT );

// Using the strided interface:
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
JPVT.fill( 0 );
out = zgeqp3.strided( N, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( out, JPVT );
