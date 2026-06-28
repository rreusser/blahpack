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
import dsbgv from './../lib/index.js';

// 3x3 diagonal matrices (KA=KB=0), A = diag(5, 6, 7), B = diag(2, 3, 4):
var AB = new Float64Array( [ 5.0, 6.0, 7.0 ] );
var BB = new Float64Array( [ 2.0, 3.0, 4.0 ] );
var W = new Float64Array( 3 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 9 );

var info = dsbgv( 'column-major', 'compute-vectors', 'upper', 3, 0, 0, AB, 1, BB, 1, W, 1, Z, 3, WORK, 1 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'Eigenvalues (W):', W );
console.log( 'Eigenvectors (Z):', Z );
