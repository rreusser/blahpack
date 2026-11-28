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
import zpbtrf from './../../zpbtrf/lib/index.js';
import zpbcon from './../lib/index.js';

const N = 3;
const kd = 1;

// Hermitian positive definite tridiagonal matrix with diagonal 4 and superdiagonal 1+i, upper band storage ((kd+1)-by-N, column-major, interleaved re/im):
const AB = new Complex128Array( [ 0.0, 0.0, 4.0, 0.0, 1.0, 1.0, 4.0, 0.0, 1.0, 1.0, 4.0, 0.0 ] );

// 1-norm of A:
const anorm = 4.0 + ( 2.0 * Math.sqrt( 2.0 ) );

// Compute the Cholesky factorization A = U^H*U:
zpbtrf( 'column-major', 'upper', N, kd, AB, kd + 1 );

const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );
const rcond = new Float64Array( 1 );

// Using the standard interface:
let info = zpbcon( 'column-major', 'upper', N, kd, AB, kd + 1, anorm, rcond, WORK, RWORK );
console.log( info, rcond[ 0 ] );

// Using the strided interface:
info = zpbcon.strided( 'upper', N, kd, AB, 1, kd + 1, 0, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
console.log( info, rcond[ 0 ] );
