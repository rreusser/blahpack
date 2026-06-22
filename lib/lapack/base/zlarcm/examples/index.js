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
import zlarcm from './../lib/index.js';

var M = 2;
var N = 2;

// 2x2 real matrix A (column-major):
var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

// 2x2 complex matrix B (column-major, interleaved re/im):
var B = new Complex128Array( [ 1.0, 1.0, 0.0, 1.0, 2.0, 0.0, 1.0, -1.0 ] );

// Output 2x2 complex matrix C and real workspace:
var C = new Complex128Array( M * N );
var RWORK = new Float64Array( 2 * M * N );

zlarcm( 'column-major', M, N, A, M, B, M, C, M, RWORK, 1 );
console.log( C ); // eslint-disable-line no-console
