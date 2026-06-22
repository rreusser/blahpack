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

/* eslint-disable camelcase */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../../dlatsqr/lib/ndarray.js';
import dorgtsqr_row from './../lib/ndarray.js';

// Reconstruct Q from a TSQR factorization of an 8-by-3 matrix.
var M = 8;
var N = 3;
var MB = 4;
var NB = 2;
var nblocal = ( NB < N ) ? NB : N;
var numblk = Math.ceil( ( M - N ) / ( MB - N ) );
var lwork = Math.max( 1, nblocal * Math.max( nblocal, N - nblocal ) );
var A = new Float64Array( M * N );
var T = new Float64Array( NB * numblk * N );
var W1 = new Float64Array( NB * N );
var W2 = new Float64Array( lwork );
var i;
var j;

for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < M; i++ ) {
		A[ i + ( j * M ) ] = ( i === j ) ? ( 4.0 + j ) : ( 1.0 / ( Math.abs( i - j ) + 1 ) ); // eslint-disable-line max-len
	}
}

dlatsqr( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W1, 1, 0 );
dorgtsqr_row( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W2, 1, 0 );

console.log( A ); // eslint-disable-line no-console
