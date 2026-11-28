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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhgeqz from './../lib/index.js';

const N = 3;

// Note: `ilo` and `ihi` are 1-based for this routine.

// 3x3 complex upper Hessenberg matrix H (column-major, interleaved real/imaginary parts):
const Hvals = [ 2.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, -1.0, 3.0, 0.5, 2.0, 0.0, 0.5, 0.0, 1.0, 1.0, 4.0, -1.0 ];

// 3x3 complex upper triangular matrix T:
const Tvals = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 2.0, 0.0, 0.0, 0.0, 0.25, 0.0, 1.0, -0.5, 3.0, 0.0 ];

// Using the standard interface:
let H = new Complex128Array( Hvals );
let T = new Complex128Array( Tvals );
let Q = new Complex128Array( N * N );
let Z = new Complex128Array( N * N );
let ALPHA = new Complex128Array( N );
let BETA = new Complex128Array( N );
let info = zhgeqz( 'column-major', 'schur', 'initialize', 'initialize', N, 1, N, H, N, T, N, ALPHA, 1, BETA, 1, Q, N, Z, N, null, null );
console.log( info );
console.log( reinterpret( ALPHA, 0 ), reinterpret( BETA, 0 ) );

// Using the strided interface:
H = new Complex128Array( Hvals );
T = new Complex128Array( Tvals );
Q = new Complex128Array( N * N );
Z = new Complex128Array( N * N );
ALPHA = new Complex128Array( N );
BETA = new Complex128Array( N );
const WORK = new Complex128Array( N );
const RWORK = new Float64Array( N );
info = zhgeqz.strided( 'schur', 'initialize', 'initialize', N, 1, N, H, 1, N, 0, T, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( info );
console.log( reinterpret( ALPHA, 0 ), reinterpret( BETA, 0 ) );
