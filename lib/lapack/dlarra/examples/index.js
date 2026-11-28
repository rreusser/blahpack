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
import dlarra from './../lib/index.js';

// Symmetric tridiagonal matrix with a negligible off-diagonal entry:
var N = 4;
var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
var e = new Float64Array( [ 1.0, 1.0e-20, 0.5, 0.0 ] );
var E2 = new Float64Array( [ 1.0, 1.0e-40, 0.25, 0.0 ] );
var nsplit = new Int32Array( 1 );
var ISPLIT = new Int32Array( N );

// Using the standard interface (absolute splitting criterion):
var info = dlarra( N, d, 1, e, 1, E2, 1, -1.0e-10, 5.0, nsplit, ISPLIT, 1 );
console.log( info, nsplit, ISPLIT ); // eslint-disable-line no-console

// Using the strided interface:
info = dlarra.strided( N, d, 1, 0, e, 1, 0, E2, 1, 0, -1.0e-10, 5.0, nsplit, ISPLIT, 1, 0 );
console.log( info, nsplit, ISPLIT ); // eslint-disable-line no-console
