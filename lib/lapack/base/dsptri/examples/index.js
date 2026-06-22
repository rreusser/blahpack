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
import dsptrf from './../../dsptrf/lib/index.js';
import dsptri from './../lib/index.js';

// 3x3 symmetric positive definite matrix (lower packed):

// [4 2 1]

// [2 5 3]

// [1 3 6]
var AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
var IPIV = new Int32Array( 3 );
var WORK = new Float64Array( 3 );

// Factor A = L * D * L^T...
var info = dsptrf( 'lower', 3, AP, IPIV );

console.log( 'dsptrf info:', info );

// Compute the inverse of A...
info = dsptri.ndarray( 'lower', 3, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );

console.log( 'dsptri info:', info );
console.log( 'inv(A) (lower packed):', AP );
