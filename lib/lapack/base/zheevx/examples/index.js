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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zheevx from './../lib/index.js';

// All eigenvalues and eigenvectors of a 3x3 Hermitian matrix A (column-major):
const N = 3;
let A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
const m = new Int32Array( 1 );
const w = new Float64Array( N );
const Z = new Complex128Array( N * N );
const WORK = new Complex128Array( 64 * N );
const RWORK = new Float64Array( 7 * N );
const IWORK = new Int32Array( 5 * N );
const IFAIL = new Int32Array( N );

// Using the standard interface:
let info = zheevx( 'column-major', 'compute-vectors', 'all', 'upper', N, A, N, 0.0, 0.0, 1, N, 0.0, m, w, 1, Z, N, WORK, RWORK, IWORK, IFAIL, 1 );
console.log( 'info:', info, 'm:', m[ 0 ], 'eigenvalues:', w );

// Using the ndarray interface:
A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
info = zheevx.ndarray( 'compute-vectors', 'all', 'upper', N, A, 1, N, 0, 0.0, 0.0, 1, N, 0.0, m, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
console.log( 'info:', info, 'm:', m[ 0 ], 'eigenvalues:', w );
