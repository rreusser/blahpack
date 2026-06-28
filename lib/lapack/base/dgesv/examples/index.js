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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgesv from './../lib/index.js';

// Solve: A * X = B where A is 3x3 (column-major) and B is 3x1
var A = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
var IPIV = new Int32Array( 3 );
var B = new Float64Array( [ 4.0, 10.0, 24.0 ] );

// Using the standard interface:
var info = dgesv( 'column-major', 3, 1, A, 3, IPIV, 1, B, 3 );
console.log( 'info:', info );
// => info: 0
console.log( 'solution X:', B );
// => solution X: Float64Array [ 1.0, 1.0, 1.0 ]

// Using the ndarray interface:
A = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
IPIV = new Int32Array( 3 );
B = new Float64Array( [ 4.0, 10.0, 24.0 ] );
info = dgesv.ndarray( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
console.log( 'info:', info );
// => info: 0
console.log( 'solution X:', B );
// => solution X: Float64Array [ 1.0, 1.0, 1.0 ]
