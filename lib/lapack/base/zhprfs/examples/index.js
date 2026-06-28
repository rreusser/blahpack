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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhprfs from './../lib/index.js';

// 2x2 Hermitian packed matrix (upper triangle):

// A = [ (4,0) (1,-1) ]

//     [ (1,1)  (5,0) ]
var AP = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 5.0, 0.0 ] );
var AFP = new Complex128Array( [ 4.0, 0.0, 1.0, -1.0, 5.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );

var B = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
var X = new Complex128Array( [ 0.25, 0.0, 0.375, 0.0 ] );

var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );

var info = zhprfs.ndarray('upper', 2, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 2, 0, X, 1, 2, 0, FERR, 1, 0, BERR, 1, 0, new Complex128Array( 4 ), 1, 0, new Float64Array( 2 ), 1, 0);

console.log( 'info = %d', info );
console.log( 'FERR = %f', FERR[ 0 ] );
console.log( 'BERR = %f', BERR[ 0 ] );
