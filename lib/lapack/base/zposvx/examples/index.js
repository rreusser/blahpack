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
import zposvx from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Column-major 3x3 Hermitian positive definite matrix (upper triangle used):
const A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 3.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 2.0, 0.0 ] );
const AF = new Complex128Array( N * N );
const s = new Float64Array( N );
const B = new Complex128Array( [ 5.0, -1.0, 5.0, 1.0, 3.0, 0.0 ] );
const X = new Complex128Array( N * nrhs );
const rcond = new Float64Array( 1 );
const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );
const equed = [ 'none' ];

// Using the standard interface:
let info = zposvx( 'column-major', 'not-factored', 'upper', N, nrhs, A, N, AF, N, equed, s, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, WORK, RWORK );
console.log( info );
// => 0

console.log( equed[ 0 ], rcond[ 0 ] );

// Using the ndarray interface:
equed[ 0 ] = 'none';
info = zposvx.ndarray( 'not-factored', 'upper', N, nrhs, A, 1, N, 0, AF, 1, N, 0, equed, s, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( info );
// => 0
