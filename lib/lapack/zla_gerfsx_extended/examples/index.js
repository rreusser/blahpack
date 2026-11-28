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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zgetrs from './../../zgetrs/lib/base.js';
import zla_gerfsx_extended from './../lib/ndarray.js';

// 3x3 diagonally dominant complex matrix (column-major):
const N = 3;
const A = new Complex128Array([ 4.0, 1.0, 1.0, 0.0, 0.5, 0.2, 1.0, -0.5, 3.0, 0.5, 0.2, 0.1, 0.3, 0.1, 0.4, -0.2, 2.5, 0.3 ]);
const B = new Complex128Array([ 1.0, 0.5, 2.0, -0.5, 0.5, 1.0 ]);
const AF = new Complex128Array( N * N );
const IPIV = new Int32Array( N );
const Y = new Complex128Array( N );
const C = new Float64Array([ 1.0, 1.0, 1.0 ]);
const BERR_OUT = new Float64Array( 1 );
const ERRS_N = new Float64Array( 3 );
const ERRS_C = new Float64Array( 3 );
const RES = new Complex128Array( N );
const AYB = new Float64Array( N );
const DY = new Complex128Array( N );
const Y_TAIL = new Complex128Array( N );
const afvi = new Float64Array( AF.buffer );
const avi = new Float64Array( A.buffer );
const yvi = new Float64Array( Y.buffer );
const bvi = new Float64Array( B.buffer );
let i;

for ( i = 0; i < 2 * N * N; i++ ) {
	afvi[ i ] = avi[ i ];
}
for ( i = 0; i < 2 * N; i++ ) {
	yvi[ i ] = bvi[ i ];
}
zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
zgetrs( 'no-transpose', N, 1, AF, 1, N, 0, IPIV, 1, 0, Y, 1, N, 0 );

zla_gerfsx_extended( 2, 'no-transpose', N, 1, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1e-3, 10, 0.5, 0.25, false );
console.log( BERR_OUT ); // eslint-disable-line no-console
