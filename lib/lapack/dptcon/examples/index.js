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
import dptcon from './../lib/index.js';

// Symmetric positive definite tridiagonal matrix A = [ 4, 1, 0; 1, 5, 2; 0, 2, 6 ]:
const N = 3;
const d = new Float64Array( [ 4.0, 5.0, 6.0 ] );
const e = new Float64Array( [ 1.0, 2.0 ] );

// One-norm of A (largest absolute column sum):
const anorm = 8.0;

// Factor A = L * D * L^T:
dpttrf( N, d, 1, e, 1 );

const rcond = new Float64Array( 1 );
const WORK = new Float64Array( N );

// Using the standard interface (estimate the reciprocal condition number of A):
let info = dptcon( N, d, 1, e, 1, anorm, rcond, WORK );
console.log( info, rcond[ 0 ] );

// Using the ndarray interface:
info = dptcon.ndarray( N, d, 1, 0, e, 1, 0, anorm, rcond, WORK, 1, 0 );
console.log( info, rcond[ 0 ] );
