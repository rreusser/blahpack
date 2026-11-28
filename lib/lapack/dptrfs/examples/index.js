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
import dpttrf from './../../dpttrf/lib/index.js';
import dpttrs from './../../dpttrs/lib/index.js';
import dptrfs from './../lib/index.js';

// Symmetric positive definite tridiagonal matrix A = [ 4, 1, 0; 1, 5, 2; 0, 2, 6 ]:
const N = 3;
const nrhs = 1;
const d = new Float64Array( [ 4.0, 5.0, 6.0 ] );
const e = new Float64Array( [ 1.0, 2.0 ] );

// Right-hand side b = A * [ 1, 1, 1 ]^T:
const B = new Float64Array( [ 5.0, 8.0, 8.0 ] );

// Factor A = L * D * L^T and compute an initial solution X:
const DF = new Float64Array( d );
const EF = new Float64Array( e );
const X = new Float64Array( B );
dpttrf( N, DF, 1, EF, 1 );
dpttrs( 'column-major', N, nrhs, DF, 1, EF, 1, X, N );

const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Float64Array( 2 * N );

// Using the standard interface (refine X and compute error bounds):
let info = dptrfs( 'column-major', N, nrhs, d, 1, e, 1, DF, 1, EF, 1, B, N, X, N, FERR, 1, BERR, 1, WORK );
console.log( info, X, FERR, BERR );

// Using the strided interface:
info = dptrfs.strided( N, nrhs, d, 1, 0, e, 1, 0, DF, 1, 0, EF, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0 );
console.log( info, X, FERR, BERR );
