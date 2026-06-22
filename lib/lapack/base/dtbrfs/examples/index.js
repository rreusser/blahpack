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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtbrfs from './../lib/index.js';

// 4x4 upper triangular band (kd=2), band storage (col-major, ldab=3):
var AB = new Float64Array([
	0,
	0,
	2,
	0,
	1,
	4,
	3,
	5,
	6,
	2,
	1,
	3
]);

// B = A * [1, 2, 3, 4] = [13, 31, 22, 12]:
var B = new Float64Array( [ 13.0, 31.0, 22.0, 12.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 12 );
var IWORK = new Int32Array( 4 );

var info = dtbrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'info:', info );   // eslint-disable-line no-console
console.log( 'FERR:', FERR );   // eslint-disable-line no-console
console.log( 'BERR:', BERR );   // eslint-disable-line no-console
