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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetri3x from './../lib/index.js';

// Trivial 1x1 example: the factored form of [[5+0i]] is itself, and its inverse is [[0.2+0i]].
var A = new Complex128Array( [ 5.0, 0.0 ] );
var e = new Complex128Array( 1 );
var ipiv = new Int32Array( [ 0 ] );
var work = new Complex128Array( 6 );

var info = zhetri3x( 'column-major', 'lower', 1, A, 1, e, 1, ipiv, 1, 0, work, 1, 1 );
console.log( info ); // eslint-disable-line no-console
console.log( A.get( 0 ) ); // eslint-disable-line no-console
