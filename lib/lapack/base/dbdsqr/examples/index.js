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
import dbdsqr from './../lib/index.js';

// Singular values and vectors of a 3x3 upper bidiagonal matrix B = Q * S * P^T:
const N = 3;

// Using the standard interface (VT, U and C start as the identity):
let d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
let e = new Float64Array( [ 1.0, 0.5 ] );
let VT = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
let U = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
let C = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
let WORK = new Float64Array( 4 * N );
let info = dbdsqr( 'row-major', 'upper', N, N, N, N, d, 1, e, 1, VT, N, U, N, C, N, WORK );
console.log( info, d, VT, U ); // eslint-disable-line no-console

// Using the ndarray interface:
d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
e = new Float64Array( [ 1.0, 0.5 ] );
VT = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
U = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
C = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
WORK = new Float64Array( 4 * N );
info = dbdsqr.ndarray( 'upper', N, N, N, N, d, 1, 0, e, 1, 0, VT, N, 1, 0, U, N, 1, 0, C, N, 1, 0, WORK, 1, 0 );
console.log( info, d, VT, U ); // eslint-disable-line no-console
