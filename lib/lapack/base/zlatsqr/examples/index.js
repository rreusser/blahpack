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
import zlatsqr from './../lib/index.js';

// 8-by-3 column-major complex matrix (interleaved real/imag pairs):
var M = 8;
var N = 3;
var mb = 4;
var nb = 2;
var A = new Complex128Array( M * N );

// T storage: nb-by-(N * Number_of_row_blocks); Number_of_row_blocks = ceil((M-N)/(mb-N)) = 5.
var T = new Complex128Array( nb * N * 5 );
var WORK = new Complex128Array( nb * N );
var info;
var i;

for ( i = 0; i < M * N; i++ ) {
	A.set( [ ( i + 1 ) * 0.5, ( i + 1 ) * 0.1 ], i );
}

info = zlatsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );
console.log( 'info = %d', info ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
