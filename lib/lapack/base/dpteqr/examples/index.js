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
import dpteqr from './../lib/index.js';

// 4x4 SPD tridiagonal matrix:

// [ 4  1  0  0 ]

// [ 1  4  1  0 ]

// [ 0  1  4  1 ]

// [ 0  0  1  4 ]

var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
var N = 4;

// Compute eigenvalues and eigenvectors:
var info = dpteqr( 'column-major', 'initialize', N, d, 1, e, 1, new Float64Array( N * N ), N, new Float64Array( 4 * N ), 1 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'eigenvalues:', d );
