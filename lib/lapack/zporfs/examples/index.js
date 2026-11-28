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
import zpotrf from './../../zpotrf/lib/index.js';
import zpotrs from './../../zpotrs/lib/index.js';
import zporfs from './../lib/index.js';

// Hermitian positive definite matrix A = [ 4, 1-i, 0; 1+i, 5, 2i; 0, -2i, 6 ] (column-major):
const N = 3;
const nrhs = 1;
const data = [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ];
const A = new Complex128Array( data );

// Right-hand side b = A * [ 1, 1, 1 ]^T:
const rhs = [ 5.0, -1.0, 6.0, 3.0, 6.0, -2.0 ];
const B = new Complex128Array( rhs );

// Factor A = U^H * U and compute an initial solution X:
const AF = new Complex128Array( data );
const X = new Complex128Array( rhs );
zpotrf( 'column-major', 'upper', N, AF, N );
zpotrs( 'column-major', 'upper', N, nrhs, AF, N, X, N );

const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

// Using the standard interface (refine X and compute error bounds):
let info = zporfs( 'column-major', 'upper', N, nrhs, A, N, AF, N, B, N, X, N, FERR, 1, BERR, 1, WORK, RWORK );
console.log( info, reinterpret( X, 0 ), FERR, BERR );

// Using the strided interface:
info = zporfs.strided( 'upper', N, nrhs, A, 1, N, 0, AF, 1, N, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( info, reinterpret( X, 0 ), FERR, BERR );
