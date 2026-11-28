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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaset from './../lib/index.js';

const N = 3;
const A = new Complex128Array( N * N );
const alpha = new Complex128( 2.0, -1.0 ); // off-diagonal value
const beta = new Complex128( 1.0, 0.0 ); // diagonal value

// Using the standard interface (set the strictly upper triangle to alpha and the diagonal to beta):
zlaset( 'row-major', 'upper', N, N, alpha, beta, A, N );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console

// Using the strided interface (set the full matrix):
zlaset.strided( 'all', N, N, alpha, beta, A, N, 1, 0 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
