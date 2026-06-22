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
import zpprfs from './../lib/index.js';

// Original 2x2 Hermitian positive definite matrix A (upper packed):

// A = [ 4+0i, 1-1i ]

//     [ 1+1i, 3+0i ]
var AP = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 3.0, 0.0 ] );

// Cholesky factor (upper, from zpptrf):
var AFP = new Complex128Array( [ 2.0, 0.0, 0.5, -0.5, 1.5811, 0.0 ] );

// Right-hand side B (1 column):
var B = new Complex128Array( [ 6.0, 2.0, 5.0, 3.0 ] );

// Initial solution X (e.g., from zpptrs):
var X = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0 ] );

var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );

var info = zpprfs.ndarray( 'upper', 2, 1, AP, 1, 0, AFP, 1, 0, B, 1, 2, 0, X, 1, 2, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'FERR:', FERR ); // eslint-disable-line no-console
console.log( 'BERR:', BERR ); // eslint-disable-line no-console
