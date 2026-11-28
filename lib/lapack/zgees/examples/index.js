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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import zgees from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};

/**
* Selects eigenvalues with a negative real part.
*
* @private
* @param {Complex128} w - eigenvalue
* @returns {boolean} boolean indicating whether to select the eigenvalue
*/
function select( w ) {
	return real( w ) < 0.0;
}

const N = 3;
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const VS = new Complex128Array( N * N );
const W = new Complex128Array( N );
const sdim = new Int32Array( 1 );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );
const BWORK = new Uint8Array( N );

// Using the standard interface:
let out = zgees( 'column-major', 'compute-vectors', 'none', select, N, A, N, sdim, W, 1, VS, N, WORK, RWORK, BWORK );
console.log( out );

// Using the strided interface (ordering selected eigenvalues first):
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
out = zgees.strided( 'compute-vectors', 'sort', select, N, A, 1, N, 0, sdim, W, 1, 0, VS, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );
console.log( out, sdim[ 0 ] );
