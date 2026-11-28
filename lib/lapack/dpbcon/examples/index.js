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
import dpbtrf from './../../dpbtrf/lib/index.js';
import dpbcon from './../lib/index.js';

const N = 3;
const kd = 1;

// Symmetric positive definite tridiagonal matrix A = tridiag( 1, 4, 1 ), upper band storage ((kd+1)-by-N, column-major):
const AB = new Float64Array( [ 0.0, 4.0, 1.0, 4.0, 1.0, 4.0 ] );

// 1-norm of A:
const anorm = 6.0;

// Compute the Cholesky factorization A = U^T*U:
dpbtrf( 'column-major', 'upper', N, kd, AB, kd + 1 );

const WORK = new Float64Array( 3 * N );
const IWORK = new Int32Array( N );
const rcond = new Float64Array( 1 );

// Using the standard interface:
let info = dpbcon( 'column-major', 'upper', N, kd, AB, kd + 1, anorm, rcond, WORK, IWORK );
console.log( info, rcond[ 0 ] );

// Using the ndarray interface:
info = dpbcon.ndarray( 'upper', N, kd, AB, 1, kd + 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, rcond[ 0 ] );
