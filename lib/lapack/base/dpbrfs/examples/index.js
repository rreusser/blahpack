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
import dpbtrf from './../../dpbtrf/lib/base.js';
import dpbtrs from './../../dpbtrs/lib/base.js';
import dpbrfs from './../lib/base.js';

var IWORK;
var WORK;
var FERR;
var BERR;
var info;
var afb;
var ab;
var b;
var x;

// 3x3 SPD band matrix with KD=1, upper band storage (LDAB=2):

// Full: [4 1 0; 1 5 1; 0 1 6]
ab = new Float64Array( [ 0.0, 4.0, 1.0, 5.0, 1.0, 6.0 ] );
afb = new Float64Array( ab );

// Factorize
dpbtrf( 'upper', 3, 1, afb, 1, 2, 0 );

// Right-hand side
b = new Float64Array( [ 1.0, 2.0, 3.0 ] );

// Solve
x = new Float64Array( b );
dpbtrs( 'upper', 3, 1, 1, afb, 1, 2, 0, x, 1, 3, 0 );

// Refine solution
FERR = new Float64Array( 1 );
BERR = new Float64Array( 1 );
WORK = new Float64Array( 9 );
IWORK = new Int32Array( 3 );

info = dpbrfs( 'upper', 3, 1, 1, ab, 1, 2, 0, afb, 1, 2, 0, b, 1, 3, 0, x, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'x:', x ); // eslint-disable-line no-console
console.log( 'FERR:', FERR ); // eslint-disable-line no-console
console.log( 'BERR:', BERR ); // eslint-disable-line no-console
