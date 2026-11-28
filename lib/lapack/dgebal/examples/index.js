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
import dgebal from './../lib/index.js';

// Balance a badly scaled 3x3 matrix (column-major):
const N = 3;
const ilo = new Int32Array( 1 );
const ihi = new Int32Array( 1 );

// Using the standard interface:
let A = new Float64Array( [ 1.0, 0.01, 0.0, 100.0, 2.0, 0.0, 3.0, 4.0, 5.0 ] );
let SCALE = new Float64Array( N );
let info = dgebal( 'column-major', 'both', N, A, N, ilo, ihi, SCALE, 1 );
console.log( info, ilo[ 0 ], ihi[ 0 ], SCALE, A ); // eslint-disable-line no-console

// Using the strided interface:
A = new Float64Array( [ 1.0, 0.01, 0.0, 100.0, 2.0, 0.0, 3.0, 4.0, 5.0 ] );
SCALE = new Float64Array( N );
info = dgebal.strided( 'both', N, A, 1, N, 0, ilo, ihi, SCALE, 1, 0 );
console.log( info, ilo[ 0 ], ihi[ 0 ], SCALE, A ); // eslint-disable-line no-console
