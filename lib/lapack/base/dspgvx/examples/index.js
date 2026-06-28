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
import dspgvx from './../lib/index.js';

// A = [4 2 1; 2 5 3; 1 3 6] in upper packed storage:
var AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );

// B = [4 2 0; 2 5 1; 0 1 3] in upper packed storage:
var BP = new Float64Array( [ 4.0, 2.0, 5.0, 0.0, 1.0, 3.0 ] );

var W = new Float64Array( 3 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 24 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 3 );
var out = { M: 0 };

var info = dspgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 3, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 3, WORK, IWORK, IFAIL ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'M (eigenvalues found):', out.M );
console.log( 'Eigenvalues (W):', W );
console.log( 'Eigenvectors (Z):', Z );
