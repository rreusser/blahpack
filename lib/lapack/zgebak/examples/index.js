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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebal from './../../zgebal/lib/index.js';
import zgebak from './../lib/index.js';

// Balance a 3x3 complex matrix with zgebal, then back-transform its (here: identity) right eigenvectors:
const N = 3;
const A = new Complex128Array( [ 1.0, 1.0, 0.01, 0.0, 0.0, 0.0, 100.0, 0.0, 2.0, -1.0, 0.0, 0.0, 3.0, 0.0, 4.0, 1.0, 5.0, 0.0 ] );
const SCALE = new Float64Array( N );
const ilo = new Int32Array( 1 );
const ihi = new Int32Array( 1 );
zgebal( 'column-major', 'both', N, A, N, ilo, ihi, SCALE, 1 );

// Using the standard interface:
let V = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
zgebak( 'column-major', 'both', 'right', N, ilo[ 0 ], ihi[ 0 ], SCALE, 1, N, V, N );
console.log( reinterpret( V, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
V = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
zgebak.ndarray( 'both', 'right', N, ilo[ 0 ], ihi[ 0 ], SCALE, 1, 0, N, V, 1, N, 0 );
console.log( reinterpret( V, 0 ) ); // eslint-disable-line no-console
