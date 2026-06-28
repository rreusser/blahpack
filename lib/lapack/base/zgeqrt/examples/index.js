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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqrt from './../lib/index.js';

// Column-major 4x3 complex matrix.
var A = new Complex128Array( 12 );
var Av = reinterpret( A, 0 );
var src = [ 2.0, 0.5, 1.0, -0.3, 3.0, 0.2, 1.0, -0.4, 1.0, -0.2, 4.0, 0.4, 2.0, 0.1, 3.0, -0.2, 3.0, 0.1, 2.0, -0.1, 5.0, 0.3, 1.0, 0.5 ]; // eslint-disable-line max-len
var T = new Complex128Array( 6 ); // T is nb-by-min(M,N) = 2-by-3
var WORK = new Complex128Array( 12 ); // workspace of length >= nb*N
var info;
var i;
for ( i = 0; i < src.length; i++ ) {
	Av[ i ] = src[ i ];
}

// Using the standard interface (column-major):
info = zgeqrt( 'column-major', 4, 3, 2, A, 4, T, 2, WORK );
console.log( info );

// Using the ndarray interface:
info = zgeqrt.ndarray( 4, 3, 2, A, 1, 4, 0, T, 1, 2, 0, WORK, 1, 0 );
console.log( info );
