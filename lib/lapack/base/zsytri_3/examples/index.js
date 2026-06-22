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
import zsytri3 from './../lib/index.js';

// Trivial 1x1 complex-symmetric example: factored form of [[5+2i]] equals itself; its inverse is [[1/(5+2i)]] = [[5/29, -2/29]].
var A = new Complex128Array( [ 5.0, 2.0 ] );
var e = new Complex128Array( [ 0.0, 0.0 ] );
var ipiv = new Int32Array( [ 0 ] );
var work = new Complex128Array( 12 );

var info = zsytri3.ndarray( 'lower', 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0, 12 );
console.log( info ); // eslint-disable-line no-console
console.log( new Float64Array( A.buffer ) ); // eslint-disable-line no-console
