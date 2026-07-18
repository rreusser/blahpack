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

import uniform from '@stdlib/random/array/uniform/lib/index.js';
import dorm22 from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};

const M = 5;
const N = 4;
const n1 = 3;
const n2 = 2;

const Q = uniform( M * M, -1.0, 1.0, opts );
const C = uniform( M * N, -1.0, 1.0, opts );
const WORK = uniform( M * N, 0.0, 1.0, opts );

const info = dorm22( 'column-major', 'left', 'no-transpose', M, N, n1, n2, Q, M, C, M, WORK, 1, M * N );
console.log( info ); // eslint-disable-line no-console
console.log( C ); // eslint-disable-line no-console
