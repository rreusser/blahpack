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

/* eslint-disable camelcase, max-len */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgbtrf from '../../zgbtrf/lib/index.js';
import zla_gbrcond_x from './../lib/index.js';

var N = 3;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;
var LDAFB = ( 2 * KL ) + KU + 1;
var AB = new Complex128Array( [ 0, 0, 2, 1, 1, 0, 3, -1, 5, 2, 4, 1, 6, -1, 8, 0, 0, 0 ] );
var AFB = new Complex128Array( LDAFB * N );
var abv = new Float64Array( AB.buffer );
var afbv = new Float64Array( AFB.buffer );
var IPIV = new Int32Array( N );
var x = new Complex128Array( [ 1.0, 0.5, 2.0, -0.5, 3.0, 1.0 ] );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );
var rcond;
var i;
var j;

// Copy AB into AFB offset by KL rows:
for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < LDAB; i++ ) {
		afbv[ 2 * ( ( KL + i ) + ( j * LDAFB ) ) ] = abv[ 2 * ( i + ( j * LDAB ) ) ];
		afbv[ ( 2 * ( ( KL + i ) + ( j * LDAFB ) ) ) + 1 ] = abv[ ( 2 * ( i + ( j * LDAB ) ) ) + 1 ];
	}
}

zgbtrf.ndarray( N, N, KL, KU, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

rcond = zla_gbrcond_x.ndarray( 'no-transpose', N, KL, KU, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0, IPIV, 1, 0, x, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( rcond ); // eslint-disable-line no-console
