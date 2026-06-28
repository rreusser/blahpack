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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zggsvd3 from './../lib/index.js';

var M = 3;
var N = 3;
var P = 2;

var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 500 );
var RWORK = new Float64Array( 4 * N );
var IWORK = new Int32Array( N );
var K = new Int32Array( 1 );
var L = new Int32Array( 1 );
var info;

A.set( [ 1.0, 0.5 ], 0 );
A.set( [ 4.0, 0.0 ], 1 );
A.set( [ 7.0, -0.5 ], 2 );
A.set( [ 2.0, 0.0 ], 3 );
A.set( [ 5.0, 1.0 ], 4 );
A.set( [ 8.0, 0.0 ], 5 );
A.set( [ 3.0, -0.5 ], 6 );
A.set( [ 6.0, 0.0 ], 7 );
A.set( [ 10.0, 0.5 ], 8 );

B.set( [ 1.0, 0.0 ], 0 );
B.set( [ 0.0, 0.0 ], 1 );
B.set( [ 0.0, 0.0 ], 2 );
B.set( [ 1.0, 0.0 ], 3 );
B.set( [ 1.0, 0.5 ], 4 );
B.set( [ 1.0, -0.5 ], 5 );

info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', M, N, P, K, L, A, M, B, P, ALPHA, 1, BETA, 1, U, M, V, P, Q, N, WORK, 1, 500, RWORK, 1, IWORK, 1 );
console.log( 'info = ' + info + ', k = ' + K[ 0 ] + ', l = ' + L[ 0 ] ); // eslint-disable-line no-console
console.log( 'alpha = ' + ALPHA.join( ', ' ) ); // eslint-disable-line no-console
console.log( 'beta = ' + BETA.join( ', ' ) ); // eslint-disable-line no-console
