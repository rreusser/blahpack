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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunbdb1 from './../lib/index.js';

// Build a tall and skinny complex matrix [X11; X21] with orthonormal columns. Here we use a real-valued 4-by-2 matrix split into two 2-by-2 blocks whose columns happen to be orthonormal.
var sq2 = 1.0 / Math.sqrt( 2.0 );
var X11 = new Complex128Array( 4 ); // 2x2 column-major
var X21 = new Complex128Array( 4 ); // 2x2 column-major
var v11 = reinterpret( X11, 0 );
var v21 = reinterpret( X21, 0 );

// Output / scalar arrays
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 2 );
var TAUP2 = new Complex128Array( 2 );
var TAUQ1 = new Complex128Array( 2 );

// Workspace of length M-Q = 4-2 = 2
var WORK = new Complex128Array( 2 );

v11[ 0 ] = sq2; // X11(0,0)
v11[ 6 ] = sq2; // X11(1,1)
v21[ 0 ] = sq2; // X21(0,0)
v21[ 6 ] = sq2; // X21(1,1)

zunbdb1( 'column-major', 4, 2, 2, X11, 2, X21, 2, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );

console.log( 'THETA =', Array.prototype.slice.call( THETA ) );
console.log( 'PHI   =', Array.prototype.slice.call( PHI ) );
console.log( 'TAUP1 =', Array.prototype.slice.call( reinterpret( TAUP1, 0 ) ) );
console.log( 'TAUP2 =', Array.prototype.slice.call( reinterpret( TAUP2, 0 ) ) );
console.log( 'TAUQ1 =', Array.prototype.slice.call( reinterpret( TAUQ1, 0 ) ) );
