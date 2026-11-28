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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasr from './../lib/index.js';

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
const A = discreteUniform( N * N, -10, 10, opts );

// Cosines and sines of the N-1 plane rotations ( c[k]^2 + s[k]^2 = 1 ):
const c = new Float64Array( [ 0.6, 0.8 ] );
const s = new Float64Array( [ 0.8, 0.6 ] );

// Using the standard interface (apply P = P(2)*P(1) from the left):
dlasr( 'row-major', 'left', 'variable', 'forward', N, N, c, 1, s, 1, A, N );
console.log( A ); // eslint-disable-line no-console

// Using the strided interface (apply the same rotations in backward order, P = P(1)*P(2)):
dlasr.strided( 'left', 'variable', 'backward', N, N, c, 1, 0, s, 1, 0, A, N, 1, 0 );
console.log( A ); // eslint-disable-line no-console
