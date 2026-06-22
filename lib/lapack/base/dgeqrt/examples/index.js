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
import dgeqrt from './../lib/index.js';

// Column-major 4x3 matrix.
var A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 1.0, 4.0, 2.0, 3.0, 3.0, 2.0, 5.0, 1.0 ] ); // eslint-disable-line max-len

// T is nb-by-min(M,N) = 2-by-3.
var T = new Float64Array( 6 );

// WORK must hold at least nb*N = 2*3 = 6 elements.
var WORK = new Float64Array( 12 );

// Using the standard interface (column-major):
var info = dgeqrt( 'column-major', 4, 3, 2, A, 4, T, 2, WORK );
console.log( info );

// Using the ndarray interface:
info = dgeqrt.ndarray( 4, 3, 2, A, 1, 4, 0, T, 1, 2, 0, WORK, 1, 0 );
console.log( info );
