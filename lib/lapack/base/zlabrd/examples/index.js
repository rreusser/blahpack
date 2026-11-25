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
import zlabrd from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const M = 4;
const N = 3;
const nb = 2;

// Using the standard interface (row-major `M`-by-`N` matrix `A`; `X` is `M`-by-`nb` and `Y` is `N`-by-`nb`):
let A = new Complex128Array( discreteUniform( 2 * M * N, -10, 10, opts ) );
let d = new Float64Array( nb );
let e = new Float64Array( nb );
let TAUQ = new Complex128Array( nb );
let TAUP = new Complex128Array( nb );
let X = new Complex128Array( M * nb );
let Y = new Complex128Array( N * nb );
zlabrd( 'row-major', M, N, nb, A, N, d, 1, e, 1, TAUQ, 1, TAUP, 1, X, nb, Y, nb );
console.log( d, e ); // eslint-disable-line no-console

// Using the ndarray interface (column-major):
A = new Complex128Array( discreteUniform( 2 * M * N, -10, 10, opts ) );
d = new Float64Array( nb );
e = new Float64Array( nb );
TAUQ = new Complex128Array( nb );
TAUP = new Complex128Array( nb );
X = new Complex128Array( M * nb );
Y = new Complex128Array( N * nb );
zlabrd.ndarray( M, N, nb, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, M, 0, Y, 1, N, 0 );
console.log( d, e ); // eslint-disable-line no-console
