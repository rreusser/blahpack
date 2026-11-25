/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
import zherk from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
const A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const C = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );

// Using the standard interface:
let out = zherk( 'row-major', 'upper', 'no-transpose', N, N, 1.0, A, N, 1.0, C, N );
console.log( reinterpret( out, 0 ) );

// Using the ndarray interface:
out = zherk.ndarray( 'upper', 'no-transpose', N, N, 1.0, A, N, 1, 0, 1.0, C, N, 1, 0 );
console.log( reinterpret( out, 0 ) );
