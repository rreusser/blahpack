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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../lib/index.js';

// 8-by-3 column-major matrix:
var M = 8;
var N = 3;
var mb = 4;
var nb = 2;
var A = new Float64Array([
	5.0,
	0.5,
	0.333,
	0.25,
	0.2,
	0.167,
	0.143,
	0.125,
	0.5,
	6.0,
	0.5,
	0.333,
	0.25,
	0.2,
	0.167,
	0.143,
	0.333,
	0.5,
	7.0,
	0.5,
	0.333,
	0.25,
	0.2,
	0.167
]);

// T storage: nb-by-(N * Number_of_row_blocks); Number_of_row_blocks = ceil((M-N)/(mb-N)) = 5.
var T = new Float64Array( nb * N * 5 );
var WORK = new Float64Array( nb * N );

var info = dlatsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );
console.log( 'info = %d', info ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
