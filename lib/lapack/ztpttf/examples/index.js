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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import ztpttf from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;

// Random complex upper triangular matrix in standard packed format:
const AP = new Complex128Array( discreteUniform( N * ( N + 1 ), -10, 10, opts ) );

// Using the standard interface:
let ARF = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
ztpttf( 'column-major', 'no-transpose', 'upper', N, AP, ARF, 1 );
console.log( reinterpret( ARF, 0 ) );

// Using the ndarray interface:
ARF = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
ztpttf.ndarray( 'no-transpose', 'upper', N, AP, 1, 0, ARF, 1, 0 );
console.log( reinterpret( ARF, 0 ) );
