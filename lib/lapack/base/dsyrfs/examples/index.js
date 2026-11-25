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
import dsytrf from './../../dsytrf/lib/index.js';
import dsytrs from './../../dsytrs/lib/index.js';
import dsyrfs from './../lib/index.js';

const N = 3;
const NRHS = 1;

// Column-major symmetric matrix (upper triangle referenced):
const A = new Float64Array( [ 4.0, 1.0, 2.0, 1.0, 5.0, 1.0, 2.0, 1.0, 6.0 ] );
const B = new Float64Array( [ 7.0, 7.0, 9.0 ] );

// Factor A = U*D*U^T and solve A*X = B:
const AF = new Float64Array( A );
const IPIV = new Int32Array( N );
dsytrf( 'column-major', 'upper', N, AF, N, IPIV, 1, new Float64Array( N * 32 ) );
const X = new Float64Array( B );
dsytrs( 'column-major', 'upper', N, NRHS, AF, N, IPIV, 1, X, N );

const FERR = new Float64Array( NRHS );
const BERR = new Float64Array( NRHS );
const WORK = new Float64Array( 3 * N );
const IWORK = new Int32Array( N );

// Using the standard interface:
let info = dsyrfs( 'column-major', 'upper', N, NRHS, A, N, AF, N, IPIV, 1, B, N, X, N, FERR, 1, BERR, 1, WORK, IWORK );
console.log( info, X, FERR, BERR );

// Using the ndarray interface:
info = dsyrfs.ndarray( 'upper', N, NRHS, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, X, FERR, BERR );
