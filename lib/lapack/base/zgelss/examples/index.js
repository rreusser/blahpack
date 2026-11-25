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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgelss from './../lib/index.js';
import { computeWorkSize } from './../lib/base.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const M = 4;
const N = 3;
const nrhs = 2;

// B is max(M,N)-by-nrhs (column-major, leading dimension M):
let A = new Complex128Array( discreteUniform( 2 * M * N, -10, 10, opts ) );
let B = new Complex128Array( discreteUniform( 2 * M * nrhs, -10, 10, opts ) );
const S = new Float64Array( Math.min( M, N ) );
const rank = new Int32Array( 1 );

// Using the standard interface (workspaces allocated internally):
let out = zgelss( 'column-major', M, N, nrhs, A, M, B, M, S, 1, -1.0, rank, null, null );
console.log( out, rank[ 0 ], S );

// Using the ndarray interface with caller-owned workspaces:
A = new Complex128Array( discreteUniform( 2 * M * N, -10, 10, opts ) );
B = new Complex128Array( discreteUniform( 2 * M * nrhs, -10, 10, opts ) );
const WORK = new Complex128Array( computeWorkSize( M, N, nrhs ) );
const RWORK = new Float64Array( 5 * Math.min( M, N ) );
out = zgelss.ndarray( M, N, nrhs, A, 1, M, 0, B, 1, M, 0, S, 1, 0, -1.0, rank, WORK, 1, 0, RWORK, 1, 0 );
console.log( out, rank[ 0 ], S );
