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
import dlaebz from './../lib/index.js';

// 3x3 symmetric tridiagonal matrix T with diagonal `d` and off-diagonal `e` (all eigenvalues lie in [-5, 5]):
var N = 3;
var MMAX = 8;
var PIVMIN = 2.2250738585072014e-308;
var d = new Float64Array( [ 2.0, -1.0, 3.0 ] );
var e = new Float64Array( [ 1.0, 1.0, 0.0 ] );
var E2 = new Float64Array( [ 1.0, 1.0, 0.0 ] );
var NVAL = new Int32Array( MMAX );
var AB = new Float64Array( MMAX * 2 );
var NAB = new Int32Array( MMAX * 2 );
var c = new Float64Array( MMAX );
var mout = new Int32Array( 1 );
var WORK = new Float64Array( MMAX );
var IWORK = new Int32Array( MMAX );
var i;

// Using the standard interface: count the eigenvalues in [-5, 5] (IJOB=1), then bisect (IJOB=2):
AB[ 0 ] = -5.0;
AB[ MMAX ] = 5.0;
dlaebz( 'column-major', 1, 0, N, MMAX, 1, 0, 0.0, 0.0, PIVMIN, d, 1, e, 1, E2, 1, NVAL, 1, AB, MMAX, c, 1, mout, NAB, MMAX, WORK, IWORK );
console.log( 'eigenvalues in [-5, 5]:', NAB[ MMAX ] - NAB[ 0 ] ); // eslint-disable-line no-console

var info = dlaebz( 'column-major', 2, 60, N, MMAX, 1, 0, 1.0e-12, 1.0e-12, PIVMIN, d, 1, e, 1, E2, 1, NVAL, 1, AB, MMAX, c, 1, mout, NAB, MMAX, WORK, IWORK );
console.log( 'info:', info ); // eslint-disable-line no-console
for ( i = 0; i < mout[ 0 ]; i++ ) {
	console.log( 'interval %d: [%d, %d] holds %d eigenvalue(s)', i, AB[ i ], AB[ MMAX + i ], NAB[ MMAX + i ] - NAB[ i ] ); // eslint-disable-line no-console
}

// Using the ndarray interface: count the eigenvalues in [-5, 0] and [0, 5] (IJOB=1):
AB[ 0 ] = -5.0;
AB[ MMAX ] = 0.0;
AB[ 1 ] = 0.0;
AB[ MMAX + 1 ] = 5.0;
dlaebz.ndarray( 1, 0, N, MMAX, 2, 0, 0.0, 0.0, PIVMIN, d, 1, 0, e, 1, 0, E2, 1, 0, NVAL, 1, 0, AB, 1, MMAX, 0, c, 1, 0, mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( 'eigenvalues in [-5, 0]:', NAB[ MMAX ] - NAB[ 0 ] ); // eslint-disable-line no-console
console.log( 'eigenvalues in [0, 5]:', NAB[ MMAX + 1 ] - NAB[ 1 ] ); // eslint-disable-line no-console
