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
import zgeevx from './../lib/index.js';

var N = 3;
var A = new Complex128Array([
	1.0,
	0.0,
	2.0,
	1.0,
	0.0,
	0.0,
	0.0,
	-1.0,
	3.0,
	0.0,
	1.0,
	0.5,
	0.0,
	0.0,
	0.0,
	0.0,
	5.0,
	-2.0
]);
var VL = new Complex128Array( N * N );
var VR = new Complex128Array( N * N );
var w = new Complex128Array( N );
var SCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );
var WORK = new Complex128Array( 4 * N );
var RWORK = new Float64Array( 2 * N );

var out = zgeevx.ndarray( 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, 1, N, 0, w, 1, 0, VL, 1, N, 0, VR, 1, N, 0, 0, 0, SCALE, 1, 0, 0, RCONDE, 1, 0, RCONDV, 1, 0, WORK, 1, 0, 4 * N, RWORK, 1, 0 );
console.log( out );
