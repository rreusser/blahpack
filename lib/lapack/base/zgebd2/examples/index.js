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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebd2 from './../lib/index.js';

// Reduce a 4x3 complex matrix (column-major) to upper bidiagonal form Q^H * A * P = B:
const M = 4;
const N = 3;

// Using the standard interface:
let A = new Complex128Array( [ 1.0, 1.0, 2.0, 0.0, 3.0, -1.0, 4.0, 0.0, 2.0, 0.0, 1.0, 2.0, 0.0, 1.0, 5.0, 0.0, 3.0, 0.0, -1.0, 0.0, 2.0, 1.0, 1.0, -2.0 ] );
let d = new Float64Array( N );
let e = new Float64Array( N - 1 );
let TAUQ = new Complex128Array( N );
let TAUP = new Complex128Array( N );
let info = zgebd2( 'column-major', M, N, A, M, d, 1, e, 1, TAUQ, 1, TAUP, 1, null );
console.log( info, d, e ); // eslint-disable-line no-console

// Using the ndarray interface:
A = new Complex128Array( [ 1.0, 1.0, 2.0, 0.0, 3.0, -1.0, 4.0, 0.0, 2.0, 0.0, 1.0, 2.0, 0.0, 1.0, 5.0, 0.0, 3.0, 0.0, -1.0, 0.0, 2.0, 1.0, 1.0, -2.0 ] );
d = new Float64Array( N );
e = new Float64Array( N - 1 );
TAUQ = new Complex128Array( N );
TAUP = new Complex128Array( N );
const WORK = new Complex128Array( Math.max( M, N ) );
info = zgebd2.ndarray( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );
console.log( info, d, e, reinterpret( TAUQ, 0 ), reinterpret( TAUP, 0 ) ); // eslint-disable-line no-console
