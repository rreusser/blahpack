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
import dgttrf from './../../dgttrf/lib/index.js';
import dgtcon from './../lib/index.js';

// Tridiagonal matrix A (N = 4) with sub-, main and super-diagonals:
const N = 4;
const DL = new Float64Array( [ 1.0, 1.0, 1.0 ] );
const d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
const DU = new Float64Array( [ 1.0, 1.0, 1.0 ] );
const DU2 = new Float64Array( N - 2 );
const IPIV = new Int32Array( N );

// The 1-norm of A (maximum absolute column sum):
const anorm = 6.0;

// Compute the LU factorization of A:
dgttrf( N, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1 );

// Using the standard interface:
const rcond = new Float64Array( 1 );
const WORK = new Float64Array( 2 * N );
const IWORK = new Int32Array( N );
let info = dgtcon( 'one-norm', N, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1, anorm, rcond, WORK, IWORK );
console.log( 'info:', info, 'rcond:', rcond[ 0 ] );

// Using the ndarray interface:
info = dgtcon.ndarray( 'one-norm', N, DL, 1, 0, d, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
console.log( 'info:', info, 'rcond:', rcond[ 0 ] );
