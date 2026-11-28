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
import zlahr2 from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
const K = 1;
const nb = 2;
let A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const tau = new Complex128Array( nb );
const T = new Complex128Array( nb * nb );
const Y = new Complex128Array( N * nb );

// Using the standard interface:
zlahr2( 'column-major', N, K, nb, A, N, tau, 1, T, nb, Y, N );
console.log( tau );

// Using the strided interface:
A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
zlahr2.strided( N, K, nb, A, 1, N, 0, tau, 1, 0, T, 1, nb, 0, Y, 1, N, 0 );
console.log( tau );
