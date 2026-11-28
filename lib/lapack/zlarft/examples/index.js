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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarft from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
const K = 2;
const V = new Complex128Array( discreteUniform( 2 * N * K, -10, 10, opts ) );
const TAU = new Complex128Array( discreteUniform( 2 * K, -1, 1, opts ) );
let T = new Complex128Array( K * K );

// Using the standard interface:
zlarft( 'column-major', 'forward', 'columnwise', N, K, V, N, TAU, 1, T, K );
console.log( reinterpret( T, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
T = new Complex128Array( K * K );
zlarft.ndarray( 'forward', 'columnwise', N, K, V, 1, N, 0, TAU, 1, 0, T, 1, K, 0 );
console.log( reinterpret( T, 0 ) ); // eslint-disable-line no-console
