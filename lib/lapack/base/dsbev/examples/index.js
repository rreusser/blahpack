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
import dsbev from './../lib/index.js';

// 4x4 symmetric tridiagonal matrix (KD=1), lower band storage:
//   4  1  0  0
//   1  5  2  0
//   0  2  6  3
//   0  0  3  7
var AB = new Float64Array( [
	4.0, 1.0, // col 1: diagonal, subdiag
	5.0, 2.0, // col 2
	6.0, 3.0, // col 3
	7.0, 0.0  // col 4
] );
var W = new Float64Array( 4 );
var Z = new Float64Array( 16 );
var WORK = new Float64Array( 10 );

var info = dsbev( 'column-major', 'compute-vectors', 'lower', 4, 1, AB, 2, W, 1, Z, 4, WORK, 1 );

console.log( 'info:', info );
console.log( 'Eigenvalues (W):', W );
console.log( 'Eigenvectors (Z):', Z );
