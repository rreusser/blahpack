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

/* eslint-disable no-console */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhf from './../lib/index.js';

// 3x3 Hermitian matrix in RFP (TRANSR='N', UPLO='U'):
var A = new Complex128Array([
	5.0,
	-1.0,
	0.0,
	6.0,
	9.0,
	0.0,
	1.0,
	0.0,
	2.0,
	3.0,
	4.0,
	0.0
]);
var WORK = new Float64Array( 3 );

var result = zlanhf( 'max', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'Max norm: ' + result );

result = zlanhf( 'one-norm', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'One norm: ' + result );

result = zlanhf( 'frobenius', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'Frobenius norm: ' + result );
