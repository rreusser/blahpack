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
import dlagtf from './../../dlagtf/lib/index.js';
import dlagts from './../lib/index.js';

// Factor the tridiagonal matrix T - lambda*I with dlagtf:
const N = 4;
const lambda = 1.0;
const a = new Float64Array( [ 4.0, 4.0, 4.0, 4.0 ] );
const b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
const c = new Float64Array( [ 2.0, 2.0, 2.0 ] );
const d = new Float64Array( N - 2 );
const IN = new Int32Array( N );
dlagtf( N, a, 1, lambda, b, 1, c, 1, 0.0, d, 1, IN, 1 );

const tol = new Float64Array( 1 );

// Using the standard interface (solve (T - lambda*I)*x = y):
let y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
let info = dlagts( 1, N, a, 1, b, 1, c, 1, d, 1, IN, 1, y, 1, tol );
console.log( 'info = %d', info );
console.log( y );

// Using the ndarray interface:
y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
info = dlagts.ndarray( 1, N, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, tol );
console.log( 'info = %d', info );
console.log( y );
