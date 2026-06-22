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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeql2 from './../lib/index.js';

// 3x2 complex matrix in column-major order. Pairs are (re, im):
var M = 3;
var N = 2;
var A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 1, 5, 1, 6, 1 ] );
var TAU = new Complex128Array( N );
var WORK = new Complex128Array( N );

// Compute the QL factorization (column-major):
var info = zgeql2( 'column-major', M, N, A, M, TAU, 1, WORK, 1 );
console.log( info );
console.log( reinterpret( A, 0 ) );
console.log( reinterpret( TAU, 0 ) );
