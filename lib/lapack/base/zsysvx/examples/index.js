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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsysvx from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Complex symmetric matrix A (column-major); B = A * [ 1, 1, 1 ]^T:
let A = new Complex128Array( [ 4.0, 1.0, 1.0, 0.0, 2.0, 0.0, 1.0, 0.0, 5.0, 0.0, 3.0, -1.0, 2.0, 0.0, 3.0, -1.0, 6.0, 0.0 ] );
let B = new Complex128Array( [ 7.0, 1.0, 9.0, -1.0, 11.0, -1.0 ] );
let AF = new Complex128Array( N * N );
let X = new Complex128Array( N * nrhs );
let IPIV = new Int32Array( N );
let rcond = new Float64Array( 1 );
let FERR = new Float64Array( nrhs );
let BERR = new Float64Array( nrhs );
let WORK = new Complex128Array( 2 * N );
let RWORK = new Float64Array( N );

// Using the standard interface:
let info = zsysvx( 'column-major', 'not-factored', 'upper', N, nrhs, A, N, AF, N, IPIV, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, RWORK );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( X, 0 ) ); // eslint-disable-line no-console
console.log( rcond[ 0 ] ); // eslint-disable-line no-console

// Using the ndarray interface:
A = new Complex128Array( [ 4.0, 1.0, 1.0, 0.0, 2.0, 0.0, 1.0, 0.0, 5.0, 0.0, 3.0, -1.0, 2.0, 0.0, 3.0, -1.0, 6.0, 0.0 ] );
B = new Complex128Array( [ 7.0, 1.0, 9.0, -1.0, 11.0, -1.0 ] );
AF = new Complex128Array( N * N );
X = new Complex128Array( N * nrhs );
IPIV = new Int32Array( N );
rcond = new Float64Array( 1 );
FERR = new Float64Array( nrhs );
BERR = new Float64Array( nrhs );
WORK = new Complex128Array( 2 * N );
RWORK = new Float64Array( N );
info = zsysvx.ndarray( 'not-factored', 'upper', N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( X, 0 ) ); // eslint-disable-line no-console
