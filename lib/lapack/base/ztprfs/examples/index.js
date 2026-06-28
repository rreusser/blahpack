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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztprfs from './../lib/index.js';

// 3x3 upper triangular packed (complex, interleaved re/im):
// A = [2+i, 1+0.5i, 4-i, 3+2i, 5, 6-0.5i]
var AP = new Complex128Array( [ 2.0, 1.0, 1.0, 0.5, 4.0, -1.0, 3.0, 2.0, 5.0, 0.0, 6.0, -0.5 ] );

// B and X are complex vectors (interleaved re/im)
var B = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
var X = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = ztprfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( 'info:', info );   // eslint-disable-line no-console
console.log( 'FERR:', FERR );   // eslint-disable-line no-console
console.log( 'BERR:', BERR );   // eslint-disable-line no-console
