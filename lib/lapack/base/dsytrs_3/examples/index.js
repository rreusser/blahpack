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
import dsytrs3 from './../lib/index.js';

// 2x2 diagonal system. The matrix is its own factorization with 1x1 pivots,

// So the off-diagonal of D (e) is zero and IPIV is [ 0, 1 ].
var A = new Float64Array( [ 4.0, 0.0, 0.0, 5.0 ] );
var e = new Float64Array( [ 0.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );
var B = new Float64Array( [ 4.0, 10.0 ] );

dsytrs3( 'column-major', 'lower', 2, 1, A, 2, e, 1, IPIV, 1, B, 2 );
console.log( B ); // => Float64Array [ 1, 2 ]
