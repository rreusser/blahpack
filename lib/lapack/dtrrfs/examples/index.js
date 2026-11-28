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
import dtrrfs from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Upper triangular matrix A (column-major), right-hand side B = A*x, and the solution x = [ 1, 2, 3 ]:
const A = new Float64Array( [ 4.0, 0.0, 0.0, 1.0, 5.0, 0.0, 2.0, 1.0, 6.0 ] );
const B = new Float64Array( [ 12.0, 13.0, 18.0 ] );
const X = new Float64Array( [ 1.0, 2.0, 3.0 ] );
const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Float64Array( 3 * N );
const IWORK = new Int32Array( N );

// Using the standard interface:
let info = dtrrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', N, nrhs, A, N, B, N, X, N, FERR, 1, BERR, 1, WORK, IWORK );
console.log( info, FERR, BERR );

// Using the strided interface:
info = dtrrfs.strided( 'upper', 'no-transpose', 'non-unit', N, nrhs, A, 1, N, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, FERR, BERR );
