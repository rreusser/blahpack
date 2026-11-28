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
import zhetd2 from './../lib/index.js';

const N = 3;
// 3x3 Hermitian matrix (column-major, interleaved real/imaginary parts):
const Avals = [ 4.0, 0.0, 1.0, 2.0, 3.0, -1.0, 1.0, -2.0, -3.0, 0.0, 2.0, 1.0, 3.0, 1.0, 2.0, -1.0, 5.0, 0.0 ];

// Using the standard interface:
let A = new Complex128Array( Avals );
let d = new Float64Array( N );
let e = new Float64Array( N - 1 );
let TAU = new Complex128Array( N - 1 );
let info = zhetd2( 'column-major', 'upper', N, A, N, d, 1, e, 1, TAU, 1 );
console.log( info );
console.log( d, e );

// Using the strided interface:
A = new Complex128Array( Avals );
d = new Float64Array( N );
e = new Float64Array( N - 1 );
TAU = new Complex128Array( N - 1 );
info = zhetd2.strided( 'upper', N, A, 1, N, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
console.log( info );
console.log( d, e );
