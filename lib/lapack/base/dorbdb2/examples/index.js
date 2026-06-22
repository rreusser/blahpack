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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorbdb2 from './../lib/index.js';

// Build an M=8, P=2, Q=2 matrix [X11; X21] with orthonormal columns. Each column has only two non-zero entries, one in X11 and one in X21, so orthonormality is easy to arrange by hand.
var sq2 = 1.0 / Math.sqrt( 2.0 );
var X11 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );                        // 2x2, column-major (P=2, Q=2)
var X21 = new Float64Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0, 0.0, 0.0, 0.0 ] ); // 6x2, column-major (M-P=6, Q=2)

// Output / scalar arrays
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Float64Array( 1 );
var TAUP2 = new Float64Array( 6 );
var TAUQ1 = new Float64Array( 2 );

// Workspace large enough for both dlarf scratch (max(P-1, M-P, Q-1) = 6) and dorbdb5 scratch (Q-1 = 1)
var WORK = new Float64Array( 16 );

dorbdb2( 'column-major', 8, 2, 2, X11, 2, X21, 6, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );

console.log( 'THETA =', Array.prototype.slice.call( THETA ) );
console.log( 'PHI   =', Array.prototype.slice.call( PHI ) );
console.log( 'TAUP1 =', Array.prototype.slice.call( TAUP1 ) );
console.log( 'TAUP2 =', Array.prototype.slice.call( TAUP2 ) );
console.log( 'TAUQ1 =', Array.prototype.slice.call( TAUQ1 ) );
