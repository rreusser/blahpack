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

/* eslint-disable camelcase */

import uniform from '@stdlib/random/array/uniform/lib/index.js';
import zla_gbamv from './../lib/index.js';

var cplxOpts = {
	'dtype': 'complex128'
};
var realOpts = {
	'dtype': 'float64'
};

var N = 4;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;

var AB = uniform( LDAB * N, -5.0, 5.0, cplxOpts );
var x = uniform( N, -5.0, 5.0, cplxOpts );
var y = uniform( N, -5.0, 5.0, realOpts );

zla_gbamv( 'column-major', 'no-transpose', N, N, KL, KU, 1.0, AB, LDAB, x, 1, 1.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
