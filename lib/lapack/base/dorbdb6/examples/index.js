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
import dorbdb6 from './../lib/index.js';

// Construct an orthonormal basis Q whose columns span (e1; e1)/sqrt(2) and (e2; e2)/sqrt(2), stored as a 4-by-2 column-major matrix split into top (Q1) and bottom (Q2) halves of two rows each.
var sq2 = 1.0 / Math.sqrt( 2.0 );
var Q1 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );
var Q2 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );

// Vector to orthogonalize: X = (1, 2, 3, 4 | 5, 6, 7, 8)
var X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var X2 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

// Workspace
var WORK = new Float64Array( 2 );

dorbdb6( 'column-major', 4, 4, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );

console.log( 'X1 =', Array.prototype.slice.call( X1 ) );
console.log( 'X2 =', Array.prototype.slice.call( X2 ) );
