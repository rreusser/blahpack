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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlacrm from './../lib/index.js';

var M = 3;
var N = 3;

var A = new Complex128Array([
	1.0,
	2.0,
	3.0,
	-1.0,
	0.5,
	4.0,
	-2.0,
	1.0,
	0.0,
	3.0,
	2.5,
	-0.5,
	1.5,
	-2.5,
	4.0,
	1.0,
	-1.0,
	2.0
]);
var B = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.0,
	2.0,
	0.0,
	0.0,
	0.0,
	0.5
]);
var C = new Complex128Array( M * N );
var RWORK = new Float64Array( 2 * M * N );

zlacrm( 'column-major', M, N, A, M, B, N, C, M, RWORK );
console.log( C ); // eslint-disable-line no-console
