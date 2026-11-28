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
import dgetrf from './../../dgetrf/lib/index.js';
import dgecon from './../lib/index.js';

// Estimate the reciprocal condition number of a 3x3 matrix (column-major) from its LU factorization:
const N = 3;
const anorm = 5.0; // 1-norm of the original matrix
const rcond = new Float64Array( 1 );

// Using the standard interface:
let A = new Float64Array( [ 4.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 2.0 ] );
let IPIV = new Int32Array( N );
dgetrf( 'column-major', N, N, A, N, IPIV, 1 );
let info = dgecon( 'column-major', 'one-norm', N, A, N, anorm, rcond, null, null );
console.log( info, rcond[ 0 ] ); // eslint-disable-line no-console

// Using the ndarray interface:
A = new Float64Array( [ 4.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 2.0 ] );
IPIV = new Int32Array( N );
const WORK = new Float64Array( 4 * N );
const IWORK = new Int32Array( N );
dgetrf.ndarray( N, N, A, 1, N, 0, IPIV, 1, 0 );
info = dgecon.ndarray( 'one-norm', N, A, 1, N, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, rcond[ 0 ] ); // eslint-disable-line no-console
