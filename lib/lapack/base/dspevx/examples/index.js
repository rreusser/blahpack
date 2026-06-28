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
import dspevx from './../lib/index.js';

// 3x3 symmetric [[2,1,0],[1,3,1],[0,1,4]] upper packed:
var AP = new Float64Array( [ 2.0, 1.0, 3.0, 0.0, 1.0, 4.0 ] );
var w = new Float64Array( 3 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 24 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 3 );
var out = {
	M: 0
};

dspevx.ndarray( 'compute-vectors', 'all', 'upper', 3, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len

console.log( 'Number of eigenvalues found: %d', out.M );
console.log( 'Eigenvalues:', w );
console.log( 'Eigenvectors (column-major):', Z );
