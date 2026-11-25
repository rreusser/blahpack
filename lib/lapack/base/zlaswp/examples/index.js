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
import zlaswp from './../lib/index.js';

const N = 3;

// 3-by-3 complex matrix (interleaved re/im):
const A0 = [ 1.0, 1.0, 2.0, 0.0, 3.0, -1.0, 4.0, 2.0, 5.0, 0.0, 6.0, 1.0, 7.0, -2.0, 8.0, 0.0, 9.0, 3.0 ];

// Row interchanges (0-based): swap row 0 with row 2, row 1 with itself, row 2 with itself:
const IPIV = new Int32Array( [ 2, 1, 2 ] );

// Using the standard interface:
let A = new Complex128Array( A0 );
let out = zlaswp( 'row-major', N, A, N, 0, N - 1, IPIV, 1, 1 );
console.log( out );

// Using the ndarray interface:
A = new Complex128Array( A0 );
out = zlaswp.ndarray( N, A, N, 1, 0, 0, N - 1, IPIV, 1, 0, 1 );
console.log( out );
