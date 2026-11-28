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
import zpotrf from './../../zpotrf/lib/index.js';
import zpotri from './../lib/index.js';

// Hermitian positive definite matrix A = [ 4, 1-i, 0; 1+i, 5, 2i; 0, -2i, 6 ] (column-major):
const N = 3;
const data = [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ];

// Using the standard interface (factor A = U^H * U, then compute inv(A) from U):
let A = new Complex128Array( data );
zpotrf( 'column-major', 'upper', N, A, N );
let info = zpotri( 'column-major', 'upper', N, A, N );
console.log( info );
// => 0
console.log( reinterpret( A, 0 ) );

// Using the ndarray interface:
A = new Complex128Array( data );
zpotrf.ndarray( 'upper', N, A, 1, N, 0 );
info = zpotri.ndarray( 'upper', N, A, 1, N, 0 );
console.log( info );
// => 0
console.log( reinterpret( A, 0 ) );
