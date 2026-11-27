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
import dsysvx from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Symmetric matrix A (column-major); B = A * [ 1, 1, 1 ]^T:
let A = new Float64Array( [ 4.0, 1.0, 2.0, 1.0, 5.0, 3.0, 2.0, 3.0, 6.0 ] );
let B = new Float64Array( [ 7.0, 9.0, 11.0 ] );
let AF = new Float64Array( N * N );
let X = new Float64Array( N * nrhs );
let IPIV = new Int32Array( N );
let rcond = new Float64Array( 1 );
let FERR = new Float64Array( nrhs );
let BERR = new Float64Array( nrhs );
let WORK = new Float64Array( 3 * N );
let IWORK = new Int32Array( N );

// Using the standard interface:
let info = dsysvx( 'column-major', 'not-factored', 'upper', N, nrhs, A, N, AF, N, IPIV, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, IWORK );
console.log( info ); // eslint-disable-line no-console
console.log( X ); // eslint-disable-line no-console
console.log( rcond[ 0 ] ); // eslint-disable-line no-console

// Using the ndarray interface:
A = new Float64Array( [ 4.0, 1.0, 2.0, 1.0, 5.0, 3.0, 2.0, 3.0, 6.0 ] );
B = new Float64Array( [ 7.0, 9.0, 11.0 ] );
AF = new Float64Array( N * N );
X = new Float64Array( N * nrhs );
IPIV = new Int32Array( N );
rcond = new Float64Array( 1 );
FERR = new Float64Array( nrhs );
BERR = new Float64Array( nrhs );
WORK = new Float64Array( 3 * N );
IWORK = new Int32Array( N );
info = dsysvx.ndarray( 'not-factored', 'upper', N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( X ); // eslint-disable-line no-console
