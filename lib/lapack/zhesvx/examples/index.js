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
import zhesvx from './../lib/index.js';

const N = 3;
const nrhs = 1;
// 3x3 Hermitian matrix (column-major, interleaved real/imaginary parts):
const Avals = [ 4.0, 0.0, 1.0, 2.0, 3.0, -1.0, 1.0, -2.0, -3.0, 0.0, 2.0, 1.0, 3.0, 1.0, 2.0, -1.0, 5.0, 0.0 ];
// Right-hand side (3x1):
const Bvals = [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0 ];

// Using the standard interface:
const A = new Complex128Array( Avals );
const B = new Complex128Array( Bvals );
let AF = new Complex128Array( N * N );
let X = new Complex128Array( N * nrhs );
let IPIV = new Int32Array( N );
let rcond = new Float64Array( 1 );
let FERR = new Float64Array( nrhs );
let BERR = new Float64Array( nrhs );
let info = zhesvx( 'column-major', 'not-factored', 'upper', N, nrhs, A, N, AF, N, IPIV, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, null, null );
console.log( info, rcond[ 0 ] );
console.log( reinterpret( X, 0 ) );

// Using the strided interface:
AF = new Complex128Array( N * N );
X = new Complex128Array( N * nrhs );
IPIV = new Int32Array( N );
rcond = new Float64Array( 1 );
FERR = new Float64Array( nrhs );
BERR = new Float64Array( nrhs );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );
info = zhesvx.strided( 'not-factored', 'upper', N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( info, rcond[ 0 ] );
console.log( reinterpret( X, 0 ) );
