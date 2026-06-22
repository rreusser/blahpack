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
import dgesvd from './../lib/index.js';

var N = 3;
var A = new Float64Array([
	1.0,
	2.0,
	3.0,
	4.0,
	5.0,
	6.0,
	7.0,
	8.0,
	10.0
]);
var s = new Float64Array( N );
var U = new Float64Array( N * N );
var VT = new Float64Array( N * N );

// Using the standard interface (row-major):
var info = dgesvd( 'row-major', 'all-columns', 'all-rows', N, N, A, N, s, 1, U, N, VT, N );
console.log( 'info: %d', info );
console.log( 's: %s', s.toString() );

// Using the ndarray interface (column-major strides):
A = new Float64Array([
	1.0,
	4.0,
	7.0,
	2.0,
	5.0,
	8.0,
	3.0,
	6.0,
	10.0
]);
s = new Float64Array( N );
U = new Float64Array( N * N );
VT = new Float64Array( N * N );
info = dgesvd.ndarray( 'all-columns', 'all-rows', N, N, A, 1, N, 0, s, 1, 0, U, 1, N, 0, VT, 1, N, 0 );
console.log( 'info: %d', info );
console.log( 's: %s', s.toString() );
