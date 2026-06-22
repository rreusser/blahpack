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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhpgvx from './../lib/index.js';

// A = [4 1-i; 1+i 5] in upper packed storage (complex interleaved):
var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );

// B = [2 0; 0 3] in upper packed storage:
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );

var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );
var out = {
	M: 0
};

var info = zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'M (eigenvalues found):', out.M ); // eslint-disable-line no-console
console.log( 'Eigenvalues (W):', W ); // eslint-disable-line no-console
console.log( 'Eigenvectors (Z):', Z ); // eslint-disable-line no-console
