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
import dlarrj from './../lib/index.js';

// Refine the eigenvalues of T = tridiag( 1, 2, 1 ), which are 2 - sqrt(2), 2, 2 + sqrt(2):
const N = 3;
const d = new Float64Array( [ 2.0, 2.0, 2.0 ] );
const E2 = new Float64Array( [ 1.0, 1.0 ] );
const PIVMIN = 2.2250738585072014e-308;
const SPDIAM = 4.0;
let w = new Float64Array( [ 0.6, 2.0, 3.4 ] );
let WERR = new Float64Array( [ 0.1, 0.1, 0.1 ] );
const WORK = new Float64Array( 2 * N );
const IWORK = new Int32Array( 2 * N );

// Using the standard interface:
let info = dlarrj( N, d, 1, E2, 1, 1, N, 1.0e-14, 0, w, 1, WERR, 1, WORK, IWORK, PIVMIN, SPDIAM );
console.log( info, w, WERR ); // eslint-disable-line no-console

// Using the strided interface:
w = new Float64Array( [ 0.6, 2.0, 3.4 ] );
WERR = new Float64Array( [ 0.1, 0.1, 0.1 ] );
info = dlarrj.strided( N, d, 1, 0, E2, 1, 0, 1, N, 1.0e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, SPDIAM );
console.log( info, w, WERR ); // eslint-disable-line no-console
