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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsyl from './../lib/index.js';

const N = 2;

// Complex upper triangular matrices A and B (column-major):
const A = new Complex128Array( [ 4.0, 1.0, 0.0, 0.0, 1.0, 0.5, 5.0, -1.0 ] );
const B = new Complex128Array( [ 7.0, 0.0, 0.0, 0.0, 2.0, 1.0, 8.0, 2.0 ] );

// Right-hand side:
const C0 = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
const scale = new Float64Array( 1 );

// Using the standard interface (solve A*X + X*B = scale*C):
let C = new Complex128Array( C0 );
let info = ztrsyl( 'column-major', 'no-transpose', 'no-transpose', 1, N, N, A, N, B, N, C, N, scale );
console.log( info, scale[ 0 ], reinterpret( C, 0 ) );

// Using the strided interface:
C = new Complex128Array( C0 );
info = ztrsyl.strided( 'no-transpose', 'no-transpose', 1, N, N, A, 1, N, 0, B, 1, N, 0, C, 1, N, 0, scale );
console.log( info, scale[ 0 ], reinterpret( C, 0 ) );
