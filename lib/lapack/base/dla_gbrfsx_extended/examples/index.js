/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable camelcase, max-len */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_gbrfsx_extended from './../lib/index.js';

// 4x4 tridiagonal pre-factored system with a known exact solution.
var N = 4;
var kl = 1;
var ku = 1;
var AB = new Float64Array( [ 0.0, 4.0, -1.0, 0.5, 4.0, -1.0, 0.5, 4.0, -1.0, 0.5, 4.0, 0.0 ] );
var AFB = new Float64Array( [ 0.0, 0.0, 4.0, -1.0, 0.0, 0.5, 4.0, -1.125, 0.0, 0.5, 3.875, -1.1290322580645162, 0.0, 0.5, 3.8709677419354835, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1, 2, 3 ] );
var b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var y = new Float64Array( [ 0.19268510258697591, 0.45851917930419267, 0.7172167707404103, 1.17930419268510267 ] );
var C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
var BERR_OUT = new Float64Array( 1 );
var EBN = new Float64Array( [ 1.0, 1.0, 1.0 ] );
var EBC = new Float64Array( [ 1.0, 1.0, 1.0 ] );
var RES = new Float64Array( N );
var AYB = new Float64Array( N );
var DY = new Float64Array( N );
var YT = new Float64Array( N );

dla_gbrfsx_extended.ndarray( 2, 'no-transpose', N, kl, ku, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, false, C, 1, 0, b, 1, N, 0, y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );

console.log( y ); // eslint-disable-line no-console
console.log( BERR_OUT ); // eslint-disable-line no-console
