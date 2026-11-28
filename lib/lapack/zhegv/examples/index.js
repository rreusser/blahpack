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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhegv from './../lib/index.js';

// Solve the generalized Hermitian-definite eigenproblem A*x = lambda*B*x (3x3, column-major):
const N = 3;
const itype = 1;
let A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
let B = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] ); // eslint-disable-line max-len
const w = new Float64Array( N );
const WORK = new Complex128Array( 64 * N );
const RWORK = new Float64Array( ( 3 * N ) - 2 );

// Using the standard interface:
let info = zhegv( 'column-major', itype, 'compute-vectors', 'upper', N, A, N, B, N, w, 1, WORK, RWORK );
console.log( 'info:', info, 'eigenvalues:', w );

// Using the strided interface:
A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
B = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] ); // eslint-disable-line max-len
info = zhegv.strided( itype, 'compute-vectors', 'upper', N, A, 1, N, 0, B, 1, N, 0, w, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( 'info:', info, 'eigenvalues:', w );
