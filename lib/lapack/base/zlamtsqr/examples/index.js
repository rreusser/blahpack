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
import zlamtsqr from './../lib/index.js';

// Apply Q^H * C with a single-block compact-WY representation (MB > M defers to zgemqrt). A and T must come from a prior zlatsqr factorization; this example uses zero matrices and only demonstrates the calling convention.
var M = 3;
var N = 2;
var K = 2;
var MB = 8;
var NB = 1;

var A = new Complex128Array( M * K );
var T = new Complex128Array( NB * K );
var C = new Complex128Array( M * N );
var WORK = new Complex128Array( N * NB );

var info = zlamtsqr( 'column-major', 'left', 'conjugate-transpose', M, N, K, MB, NB, A, M, T, NB, C, M, WORK, 1, WORK.length );
console.log( 'info=' + info ); // eslint-disable-line no-console
console.log( C ); // eslint-disable-line no-console
