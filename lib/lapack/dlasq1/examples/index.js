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
import dlasq1 from './../lib/index.js';

// Compute the singular values of an upper bidiagonal matrix with diagonal `d` and superdiagonal `e`:
const N = 4;
let d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
let e = new Float64Array( [ 1.0, 0.5, 0.25 ] );
const WORK = new Float64Array( 4 * N );

// Using the standard interface:
let info = dlasq1( N, d, 1, e, 1, WORK );
console.log( info, d ); // eslint-disable-line no-console

// Using the strided interface:
d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
e = new Float64Array( [ 1.0, 0.5, 0.25 ] );
info = dlasq1.strided( N, d, 1, 0, e, 1, 0, WORK, 1, 0 );
console.log( info, d ); // eslint-disable-line no-console
