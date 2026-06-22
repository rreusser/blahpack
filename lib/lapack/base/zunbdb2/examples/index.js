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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunbdb2 from './../lib/index.js';

// Build an M=8, P=2, Q=2 complex matrix [X11; X21] with orthonormal columns. Each column has two non-zero entries (1/sqrt(2) each), one in X11 and one in X21.
var sq2 = 1.0 / Math.sqrt( 2.0 );

// X11 is 2x2, column-major: column 0 = [sq2; 0], column 1 = [0; sq2].
var X11 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );

// X21 is 6x2, column-major: column 0 has sq2 at row 0, column 1 has sq2 at row 3.
var X21 = new Complex128Array( 6 * 2 );

var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 1 );
var TAUP2 = new Complex128Array( 6 );
var TAUQ1 = new Complex128Array( 2 );

// Workspace large enough for both zlarf scratch (max(P-1, M-P, Q-1) = 6) and zunbdb5 scratch (Q-1 = 1).
var WORK = new Complex128Array( 16 );

X21.set( [ sq2, 0.0 ], 0 );
X21.set( [ sq2, 0.0 ], 6 + 3 );

zunbdb2( 'column-major', 8, 2, 2, X11, 2, X21, 6, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );

console.log( 'THETA =', Array.prototype.slice.call( THETA ) ); // eslint-disable-line no-console
console.log( 'PHI   =', Array.prototype.slice.call( PHI ) ); // eslint-disable-line no-console
