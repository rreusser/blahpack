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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zsymv from './../lib/index.js';

// Complex symmetric 3x3 matrix (column-major):
const N = 3;
const dataA = [ 4.0, 1.0, 1.0, 0.0, 2.0, -1.0, 1.0, 0.0, 3.0, 0.5, 0.5, 0.0, 2.0, -1.0, 0.5, 0.0, 5.0, 2.0 ];
const A = new Complex128Array( dataA );
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, -1.0, 2.0 ] );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );
let y = new Complex128Array( N );

// Using the standard interface (y = alpha*A*x + beta*y):
let out = zsymv( 'column-major', 'upper', N, alpha, A, N, x, 1, beta, y, 1 );
console.log( out );

// Using the strided interface:
y = new Complex128Array( N );
out = zsymv.strided( 'upper', N, alpha, A, 1, N, 0, x, 1, 0, beta, y, 1, 0 );
console.log( out );
