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
import ztrttf from './../lib/index.js';

const N = 3;

// Column-major entries of a 3-by-3 upper triangular complex matrix:
const A = new Complex128Array( [
	2.0, 1.0, 0.0, 0.0, 0.0, 0.0,
	1.0, -1.0, 3.0, 0.0, 0.0, 0.0,
	0.0, 2.0, 1.0, 1.0, 4.0, -1.0
] );

// Rectangular full packed storage holds N*(N+1)/2 elements:
const ARF = new Complex128Array( ( N * ( N + 1 ) ) / 2 );

// Using the standard interface:
let info = ztrttf( 'column-major', 'no-transpose', 'upper', N, A, N, ARF, 1 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( ARF, 0 ) ); // eslint-disable-line no-console

// Using the strided interface, in conjugate-transposed RFP format:
info = ztrttf.strided( 'conjugate-transpose', 'upper', N, A, 1, N, 0, ARF, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( ARF, 0 ) ); // eslint-disable-line no-console
