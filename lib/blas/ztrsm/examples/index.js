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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import ztrsm from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
const alpha = new Complex128( 1.0, 0.0 );

// Random complex upper triangular A (row-major), made diagonally dominant:
const A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const Av = reinterpret( A, 0 );
let i;
for ( i = 0; i < N; i++ ) {
	Av[ 2 * ( ( i * N ) + i ) ] += 50.0;
}
const Binit = discreteUniform( 2 * N * N, -10, 10, opts );

// Using the standard interface:
let B = new Complex128Array( Binit );
let out = ztrsm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', N, N, alpha, A, N, B, N );
console.log( reinterpret( out, 0 ) );

// Using the strided interface:
B = new Complex128Array( Binit );
out = ztrsm.strided( 'left', 'upper', 'no-transpose', 'non-unit', N, N, alpha, A, N, 1, 0, B, N, 1, 0 );
console.log( reinterpret( out, 0 ) );
