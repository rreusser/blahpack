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
import zungrq from './../lib/index.js';

var M = 3;
var N = 4;
var K = M;
var A = new Complex128Array( M * N );
var TAU = new Complex128Array( K );
var WORK = new Complex128Array( M * 32 );

// Using the standard interface (column-major):
var out = zungrq( 'column-major', M, N, K, A, M, TAU, 1, WORK, 1 );
console.log( out ); // eslint-disable-line no-console

// Using the ndarray interface:
out = zungrq.ndarray( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
console.log( out ); // eslint-disable-line no-console
