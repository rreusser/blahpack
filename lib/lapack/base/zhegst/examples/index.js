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
import zhegst from './../lib/index.js';

// Reduce the generalized Hermitian-definite problem A*x = lambda*B*x to standard form (3x3, column-major):
const N = 3;
const itype = 1;
let A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
const B = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] ); // eslint-disable-line max-len

// Compute the Cholesky factorization B = U**H * U:
zpotrf( 'column-major', 'upper', N, B, N );

// Using the standard interface:
let info = zhegst( 'column-major', itype, 'upper', N, A, N, B, N );
console.log( 'info:', info, 'A:', reinterpret( A, 0 ) );

// Using the ndarray interface:
A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
info = zhegst.ndarray( itype, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
console.log( 'info:', info, 'A:', reinterpret( A, 0 ) );
