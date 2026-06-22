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
import dsycon3 from './../lib/index.js';

// 3x3 diagonal "factorization" with 1x1 pivots; D = diag(4, 4, 4), e = 0.
var A = new Float64Array( [ 4.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.0, 0.0, 4.0 ] );
var e = new Float64Array( [ 0.0, 0.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var work = new Float64Array( 6 );
var iwork = new Int32Array( 3 );
var rcond = new Float64Array( 1 );

dsycon3( 'column-major', 'upper', 3, A, 3, e, 1, IPIV, 1, 4.0, rcond, work, 1, iwork, 1 );
console.log( rcond[ 0 ] ); // => 1 // eslint-disable-line no-console
