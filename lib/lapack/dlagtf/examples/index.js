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
import dlagtf from './../lib/index.js';

// Tridiagonal matrix T with diagonal `a`, super-diagonal `b` and sub-diagonal `c`:
const N = 4;
const lambda = 1.0;
const tol = 0.0;
let a = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
let b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
let c = new Float64Array( [ 2.0, 2.0, 2.0 ] );
const d = new Float64Array( N - 2 );
const IN = new Int32Array( N );

// Using the standard interface (factor T - lambda*I = P*L*U):
let info = dlagtf( N, a, 1, lambda, b, 1, c, 1, tol, d, 1, IN, 1 );
console.log( 'info = %d', info );
console.log( a, b, c, d, IN );

// Using the strided interface:
a = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
c = new Float64Array( [ 2.0, 2.0, 2.0 ] );
info = dlagtf.strided( N, a, 1, 0, lambda, b, 1, 0, c, 1, 0, tol, d, 1, 0, IN, 1, 0 );
console.log( 'info = %d', info );
console.log( a, b, c, d, IN );
