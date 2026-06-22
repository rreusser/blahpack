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

import uniform from '@stdlib/random/array/uniform/lib/index.js';
import dorm22 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};

var M = 5;
var N = 4;
var n1 = 3;
var n2 = 2;

var Q = uniform( M * M, -1.0, 1.0, opts );
var C = uniform( M * N, -1.0, 1.0, opts );
var WORK = uniform( M * N, 0.0, 1.0, opts );

var info = dorm22( 'column-major', 'left', 'no-transpose', M, N, n1, n2, Q, M, C, M, WORK, 1, M * N );
console.log( info ); // eslint-disable-line no-console
console.log( C ); // eslint-disable-line no-console
