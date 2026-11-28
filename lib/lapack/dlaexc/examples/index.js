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
import dlaexc from './../lib/index.js';

// 3x3 upper triangular matrix in Schur form (column-major):
let T = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );

// Orthogonal matrix Q (identity):
let Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
const WORK = new Float64Array( 3 );

// Using the standard interface (swap the 1x1 blocks at rows 1 and 2):
let info = dlaexc( 'column-major', true, 3, T, 3, Q, 3, 1, 1, 1, WORK );
console.log( 'info = %d', info );
console.log( T );
console.log( Q );

// Using the strided interface:
T = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
info = dlaexc.strided( true, 3, T, 1, 3, 0, Q, 1, 3, 0, 1, 1, 1, WORK, 1, 0 );
console.log( 'info = %d', info );
console.log( T );
console.log( Q );
