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
import dorbdb3 from './../lib/index.js';

// Build a tall and skinny matrix [X11; X21] with orthonormal columns. We use M=4, P=3, Q=2 (M-P=1, the dorbdb3 partition where the lower block is the smallest dimension).
var sq3 = 1.0 / Math.sqrt( 3.0 );
var sq6 = 1.0 / Math.sqrt( 6.0 );

// X11 is 3x2 (column-major); X21 is 1x2 (column-major). Columns of [X11; X21] are orthonormal.
var X11 = new Float64Array( [ sq3, sq3, sq3, sq6, sq6, -2.0 * sq6 ] );
var X21 = new Float64Array( [ 0.0, 0.0 ] );

// Output / scalar arrays
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Float64Array( 3 );
var TAUP2 = new Float64Array( 1 );
var TAUQ1 = new Float64Array( 2 );

// Workspace of size at least max(P, M-P-1, Q-1) = max(3, 0, 1) = 3
var WORK = new Float64Array( 4 );

dorbdb3( 'column-major', 4, 3, 2, X11, 3, X21, 1, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );

console.log( 'THETA =', Array.prototype.slice.call( THETA ) );
console.log( 'PHI   =', Array.prototype.slice.call( PHI ) );
console.log( 'TAUP1 =', Array.prototype.slice.call( TAUP1 ) );
console.log( 'TAUP2 =', Array.prototype.slice.call( TAUP2 ) );
console.log( 'TAUQ1 =', Array.prototype.slice.call( TAUQ1 ) );
