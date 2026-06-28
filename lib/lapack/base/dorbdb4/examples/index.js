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
import dorbdb4 from './../lib/index.js';

// Build a tall and skinny matrix [X11; X21] with orthonormal columns. M=4, P=2, Q=4: the variant 4 constraint is M-Q=0 <= min(P, M-P, Q) = min(2, 2, 4). Columns are e_1, e_2, e_3, e_4.
var X11 = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0 ] ); // 2x4 column-major
var X21 = new Float64Array( [ 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0 ] ); // 2x4 column-major

// Output / scalar arrays
var THETA = new Float64Array( 4 );
var PHI = new Float64Array( 3 );
var TAUP1 = new Float64Array( 1 );
var TAUP2 = new Float64Array( 1 );
var TAUQ1 = new Float64Array( 4 );

// PHANTOM (length M=4) and workspace
var PHANTOM = new Float64Array( 4 );
var WORK = new Float64Array( 8 );

dorbdb4( 'column-major', 4, 2, 4, X11, 2, X21, 2, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, PHANTOM, 1, WORK, 1 );

console.log( 'THETA =', Array.prototype.slice.call( THETA ) );
console.log( 'PHI   =', Array.prototype.slice.call( PHI ) );
console.log( 'TAUQ1 =', Array.prototype.slice.call( TAUQ1 ) );
