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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zspmv from './../lib/index.js';

// Upper triangle of the complex symmetric matrix A = [ 1+i, 2, 3-i; 2, 4+2i, 5; 3-i, 5, 6 ] in packed storage:
const N = 3;
const AP = new Complex128Array( [ 1.0, 1.0, 2.0, 0.0, 4.0, 2.0, 3.0, -1.0, 5.0, 0.0, 6.0, 0.0 ] );
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, -1.0 ] );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );

// Using the standard interface (compute y = alpha*A*x + beta*y):
let y = new Complex128Array( N );
zspmv( 'column-major', 'upper', N, alpha, AP, x, 1, beta, y, 1 );
console.log( reinterpret( y, 0 ) );

// Using the strided interface:
y = new Complex128Array( N );
zspmv.strided( 'upper', N, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
console.log( reinterpret( y, 0 ) );
