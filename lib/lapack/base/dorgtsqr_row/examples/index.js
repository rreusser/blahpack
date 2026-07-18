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

/* eslint-disable camelcase */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../../dlatsqr/lib/ndarray.js';
import dorgtsqr_row from './../lib/ndarray.js';

// Reconstruct Q from a TSQR factorization of an 8-by-3 matrix.
const M = 8;
const N = 3;
const MB = 4;
const NB = 2;
const nblocal = ( NB < N ) ? NB : N;
const numblk = Math.ceil( ( M - N ) / ( MB - N ) );
const lwork = Math.max( 1, nblocal * Math.max( nblocal, N - nblocal ) );
const A = new Float64Array( M * N );
const T = new Float64Array( NB * numblk * N );
const W1 = new Float64Array( NB * N );
const W2 = new Float64Array( lwork );
let i, j;

for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < M; i++ ) {
		A[ i + ( j * M ) ] = ( i === j ) ? ( 4.0 + j ) : ( 1.0 / ( Math.abs( i - j ) + 1 ) ); // eslint-disable-line max-len
	}
}

dlatsqr( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W1, 1, 0 );
dorgtsqr_row( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W2, 1, 0 );

console.log( A ); // eslint-disable-line no-console
