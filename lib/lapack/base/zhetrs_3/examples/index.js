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
import zhetrs3 from './../lib/index.js';

// Diagonal Hermitian system. Each column of the storage holds (re, im)

// pairs; the imaginary part of every diagonal entry is zero by definition.
var A = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
var e = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );
var B = new Complex128Array( [ 4.0, 0.0, 10.0, 0.0 ] );

zhetrs3( 'column-major', 'lower', 2, 1, A, 2, e, 1, IPIV, 1, B, 2 );
console.log( B.get( 0 ).re, B.get( 1 ).re ); // => 1 2
