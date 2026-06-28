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
import zunbdb5 from './../lib/index.js';

// Construct an orthonormal basis Q whose two columns span (e1; e1)/sqrt(2) and (e2; e2)/sqrt(2), stored as 2-by-2 column-major matrices split into top (Q1) and bottom (Q2) halves. All entries are real (zero imaginary parts).
var sq2 = 1.0 / Math.sqrt( 2.0 );
var Q1 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var Q2 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );

// Complex vector to orthogonalize: X1 = ((1+1i), (2+2i)); X2 = ((3+3i), (4+4i)).
var X1 = new Complex128Array( [ 1.0, 1.0, 2.0, 2.0 ] );
var X2 = new Complex128Array( [ 3.0, 3.0, 4.0, 4.0 ] );

// Workspace
var WORK = new Complex128Array( 2 );

zunbdb5( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );

console.log( 'X1 =', Array.prototype.slice.call( X1 ) );
console.log( 'X2 =', Array.prototype.slice.call( X2 ) );
