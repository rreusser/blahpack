/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

var cplxOpts = {
	'dtype': 'complex128'
};
var realOpts = {
	'dtype': 'float64'
};

var M = 3;
var N = 3;
var A = uniform( M * N, -10.0, 10.0, cplxOpts );
var x = uniform( N, -10.0, 10.0, cplxOpts );
var y = uniform( M, -10.0, 10.0, realOpts );

zlaGeamv( 'row-major', 'no-transpose', M, N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
