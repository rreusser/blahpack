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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import ztrcon from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;

// Random complex upper triangular matrix (column-major) with a dominant diagonal:
const A = new Complex128Array( discreteUniform( 2 * N * N, -10, 10, opts ) );
const Av = reinterpret( A, 0 );
let i;
for ( i = 0; i < N; i++ ) {
	Av[ 2 * ( ( i * N ) + i ) ] += 20.0;
}
const RCOND = new Float64Array( 1 );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

// Using the standard interface:
let info = ztrcon( 'column-major', 'one-norm', 'upper', 'non-unit', N, A, N, RCOND, WORK, RWORK );
console.log( info, RCOND[ 0 ] );

// Using the ndarray interface:
info = ztrcon.ndarray( 'inf-norm', 'upper', 'non-unit', N, A, 1, N, 0, RCOND, WORK, 1, 0, RWORK, 1, 0 );
console.log( info, RCOND[ 0 ] );
