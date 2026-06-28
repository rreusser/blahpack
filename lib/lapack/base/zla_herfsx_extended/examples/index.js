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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlaHerfsxExtended from './../lib/index.js';

// Construct a 2x2 Hermitian matrix A (column-major).
var A = new Complex128Array( 4 );
var Av = new Float64Array( A.buffer );
var AF = new Complex128Array( 4 );
var AFv = new Float64Array( AF.buffer );
var IPIV = new Int32Array( [ 0, 1 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );
var B = new Complex128Array( 2 );
var Bv = new Float64Array( B.buffer );
var Y = new Complex128Array( 2 );
var berrOut = new Float64Array( 1 );
var errBndsNorm = new Float64Array( 3 );
var errBndsComp = new Float64Array( 3 );
var RES = new Complex128Array( 2 );
var AYB = new Float64Array( 2 );
var DY = new Complex128Array( 2 );
var yTail = new Complex128Array( 2 );

Av[ 0 ] = 4.0;
Av[ 2 ] = 1.0;
Av[ 3 ] = 1.0;
Av[ 4 ] = 1.0;
Av[ 5 ] = -1.0;
Av[ 6 ] = 3.0;
AFv.set( Av );
Bv[ 0 ] = 1.0;
Bv[ 2 ] = 2.0;

zlaHerfsxExtended.ndarray( 1, 'upper', 2, 1, A, 1, 2, 0, AF, 1, 2, 0, IPIV, 1, 0, false, c, 1, 0, B, 1, 2, 0, Y, 1, 2, 0, berrOut, 1, 0, 2, errBndsNorm, 1, 1, 0, errBndsComp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, 1e-10, 10, 0.5, 0.25, false );
console.log( berrOut ); // eslint-disable-line no-console
