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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgtsvx from './../lib/index.js';

// Tridiagonal matrix A (N = 4); the right-hand side is b = A*[1,2,3,4]:
const N = 4;
const nrhs = 1;
const DL = new Float64Array( [ 1.0, 1.0, 1.0 ] );
const d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
const DU = new Float64Array( [ 1.0, 1.0, 1.0 ] );
const B = new Float64Array( [ 6.0, 12.0, 18.0, 19.0 ] );

const DLF = new Float64Array( N - 1 );
const DF = new Float64Array( N );
const DUF = new Float64Array( N - 1 );
const DU2 = new Float64Array( N - 2 );
const IPIV = new Int32Array( N );
const X = new Float64Array( N * nrhs );
const rcond = new Float64Array( 1 );
const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Float64Array( 3 * N );
const IWORK = new Int32Array( N );

// Using the standard interface:
let info = dgtsvx( 'column-major', 'not-factored', 'no-transpose', N, nrhs, DL, 1, d, 1, DU, 1, DLF, 1, DF, 1, DUF, 1, DU2, 1, IPIV, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, IWORK );
console.log( 'info:', info, 'X:', X, 'rcond:', rcond[ 0 ] );

// Using the ndarray interface (reusing the factorization computed above):
info = dgtsvx.ndarray( 'factored', 'no-transpose', N, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( 'info:', info, 'X:', X, 'rcond:', rcond[ 0 ] );
