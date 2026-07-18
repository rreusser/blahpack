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

/* eslint-disable camelcase, stdlib/require-file-extensions */

import uniform from '@stdlib/random/array/uniform/lib/index.js';
import zlaGeamv from '@stdlib/lapack/base/zla_geamv';

const cplxOpts = {
	'dtype': 'complex128'
};
const realOpts = {
	'dtype': 'float64'
};

const M = 3;
const N = 3;
const A = uniform( M * N, -10.0, 10.0, cplxOpts );
const x = uniform( N, -10.0, 10.0, cplxOpts );
const y = uniform( M, -10.0, 10.0, realOpts );

zlaGeamv( 'row-major', 'no-transpose', M, N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
