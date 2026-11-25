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
import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import zgttrf from './../../zgttrf/lib/index.js';
import zgtcon from './../lib/index.js';

// Complex tridiagonal matrix A (N = 4) with sub-, main and super-diagonals:
const N = 4;
const DL = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
const d = new Complex128Array( [ 4.0, 0.0, 4.0, 0.0, 4.0, 0.0, 4.0, 0.0 ] );
const DU = new Complex128Array( [ 1.0, -1.0, 1.0, -1.0, 1.0, -1.0 ] );
const DU2 = new Complex128Array( N - 2 );
const IPIV = new Int32Array( N );

// The 1-norm of A (maximum absolute column sum, |1+i| + 4 + |1-i|):
const anorm = 4.0 + ( 2.0 * sqrt( 2.0 ) );

// Compute the LU factorization of A:
zgttrf( N, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1 );

// Using the standard interface:
const rcond = new Float64Array( 1 );
const WORK = new Complex128Array( 2 * N );
let info = zgtcon( 'one-norm', N, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1, anorm, rcond, WORK );
console.log( 'info:', info, 'rcond:', rcond[ 0 ] );

// Using the ndarray interface:
info = zgtcon.ndarray( 'one-norm', N, DL, 1, 0, d, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, WORK, 1, 0 );
console.log( 'info:', info, 'rcond:', rcond[ 0 ] );
