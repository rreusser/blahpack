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
import dtrexc from './../lib/index.js';

const ifst = new Int32Array( 1 );
const ilst = new Int32Array( 1 );

/** @type {{ dtype: 'float64' }} */
const opts = {
	'dtype': 'float64'
};
const N = 3;
const T = discreteUniform( N * N, -10, 10, opts );
const Q = discreteUniform( N * N, -10, 10, opts );
const WORK = discreteUniform( N, -10, 10, opts );

// Using the standard interface:
ifst[ 0 ] = 1;
ilst[ 0 ] = 1;
let out = {
	'info': dtrexc( 'column-major', 'update', N, T, N, Q, N, ifst, ilst, WORK ),
	'ifst': ifst[ 0 ],
	'ilst': ilst[ 0 ]
};
console.log( out );

// Using the ndarray interface:
ifst[ 0 ] = 1;
ilst[ 0 ] = 1;
out = {
	'info': dtrexc.ndarray( 'update', N, T, N, 1, 0, Q, N, 1, 0, ifst, ilst, WORK, 1, 0 ),
	'ifst': ifst[ 0 ],
	'ilst': ilst[ 0 ]
};
console.log( out );
