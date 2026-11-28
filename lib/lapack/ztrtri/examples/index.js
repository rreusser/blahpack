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
import ztrtri from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;

// Random complex upper triangular matrix (row-major) with a dominant diagonal:
const A0 = discreteUniform( 2 * N * N, -10, 10, opts );
let i;
for ( i = 0; i < N; i++ ) {
	A0[ 2 * ( ( i * N ) + i ) ] += 20.0;
}

// Using the standard interface:
let A = new Complex128Array( A0 );
let info = ztrtri( 'row-major', 'upper', 'non-unit', N, A, N );
console.log( info, reinterpret( A, 0 ) );

// Using the strided interface:
A = new Complex128Array( A0 );
info = ztrtri.strided( 'upper', 'non-unit', N, A, N, 1, 0 );
console.log( info, reinterpret( A, 0 ) );
