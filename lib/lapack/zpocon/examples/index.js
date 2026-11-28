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
import zpotrf from './../../zpotrf/lib/index.js';
import zpocon from './../lib/index.js';

// Hermitian positive definite matrix A = [ 4, 1-i, 0; 1+i, 5, 2i; 0, -2i, 6 ] (column-major):
const N = 3;
const data = [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ];

// One-norm of A (largest absolute column sum):
const anorm = 7.0 + Math.SQRT2;

const rcond = new Float64Array( 1 );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

// Using the standard interface (factor A, then estimate its reciprocal condition number):
let A = new Complex128Array( data );
zpotrf( 'column-major', 'upper', N, A, N );
let info = zpocon( 'column-major', 'upper', N, A, N, anorm, rcond, WORK, RWORK );
console.log( info, rcond[ 0 ] );

// Using the strided interface:
A = new Complex128Array( data );
zpotrf.strided( 'upper', N, A, 1, N, 0 );
info = zpocon.strided( 'upper', N, A, 1, N, 0, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
console.log( info, rcond[ 0 ] );
