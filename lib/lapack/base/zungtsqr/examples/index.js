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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatsqr from './../../zlatsqr/lib/base.js';
import zungtsqr from './../lib/index.js';

const M = 6;
const N = 2;
const mb = 3;
const nb = 2;
const A = new Complex128Array( M * N );
const Av = reinterpret( A, 0 );
const numblk = Math.ceil( ( M - N ) / ( mb - N ) );
const T = new Complex128Array( nb * numblk * N );
let WORK = new Complex128Array( nb * N );
let idx, i, j;

// Build a small tall panel A (M-by-N), column-major.
for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < M; i++ ) {
		idx = ( ( j * M ) + i ) * 2;
		Av[ idx ] = ( i === j ) ? 5.0 + j : 1.0 / ( Math.abs( i - j ) + 1.0 );
		Av[ idx + 1 ] = -0.1 * ( i - j );
	}
}

// Run zlatsqr to compute the V/T factors of a Tall-Skinny QR.
zlatsqr( M, N, mb, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );

// Build Q in A using zungtsqr (standard interface).
WORK = new Complex128Array( ( M + nb ) * N );
zungtsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK, 1 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console

// Equivalent call via the ndarray interface:
zungtsqr.ndarray( M, N, mb, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
