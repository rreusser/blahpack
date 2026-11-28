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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrf from './../../zhetrf/lib/index.js';
import zla_herpvgrw from './../lib/index.js';

// 3x3 Hermitian indefinite matrix (column-major, interleaved real/imaginary parts):
const N = 3;
const A = new Complex128Array( [
	4.0, 0.0, 1.0, -1.0, 0.5, 0.0,
	1.0, 1.0, 5.0, 0.0, 0.0, -2.0,
	0.5, 0.0, 0.0, 2.0, 6.0, 0.0
] );
const AF = new Complex128Array( A );
const IPIV = new Int32Array( N );
const WORK = new Float64Array( 2 * N );

// Factor A:
const info = zhetrf( 'column-major', 'upper', N, AF, N, IPIV, 1, null );

// Using the standard interface:
let out = zla_herpvgrw( 'column-major', 'upper', N, info, A, N, AF, N, IPIV, 1, WORK );
console.log( out ); // eslint-disable-line no-console

// Using the strided interface:
out = zla_herpvgrw.strided( 'upper', N, info, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
console.log( out ); // eslint-disable-line no-console
