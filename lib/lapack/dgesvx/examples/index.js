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
import dgesvx from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Column-major 3x3 matrix and right-hand side (solution is [ 1, 1, 1 ]):
const A = new Float64Array( [ 4.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 2.0 ] );
const AF = new Float64Array( N * N );
const IPIV = new Int32Array( N );
const r = new Float64Array( N );
const c = new Float64Array( N );
const B = new Float64Array( [ 5.0, 5.0, 3.0 ] );
const X = new Float64Array( N * nrhs );
const rcond = new Float64Array( 1 );
const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Float64Array( 4 * N );
const IWORK = new Int32Array( N );
const equed = [ 'none' ];

// Using the standard interface:
let info = dgesvx( 'column-major', 'not-factored', 'no-transpose', N, nrhs, A, N, AF, N, IPIV, 1, equed, r, 1, c, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, IWORK );
console.log( info );
// => 0

console.log( X );
// => <Float64Array>[ ~1.0, ~1.0, ~1.0 ]

console.log( equed[ 0 ], rcond[ 0 ], WORK[ 0 ] ); // equilibration, reciprocal condition number, reciprocal pivot growth

// Using the strided interface:
equed[ 0 ] = 'none';
info = dgesvx.strided( 'not-factored', 'no-transpose', N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( info );
// => 0

console.log( X );
// => <Float64Array>[ ~1.0, ~1.0, ~1.0 ]
