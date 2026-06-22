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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlatsqr from './../../dlatsqr/lib/ndarray.js';
import dorgtsqr_row from './../lib/ndarray.js';
import { name as pkg } from './../package.json' with { type: 'json' };


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} M - matrix row count
* @param {PositiveInteger} N - matrix column count
* @param {PositiveInteger} MB - row block size
* @param {PositiveInteger} NB - column block size
* @returns {Function} benchmark function
*/
function createBenchmark( M, N, MB, NB ) {
	var nblocal;
	var numblk;
	var lwork;
	var Aref;
	var Tref;
	var WORK;
	var lwk1;
	var WK1;
	var i;
	var j;

	Aref = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aref[ i + ( j * M ) ] = ( i === j ) ? ( 5.0 + j ) : ( 0.5 / ( Math.abs( i - j ) + 1 ) ); // eslint-disable-line max-len
		}
	}
	numblk = ( MB >= M ) ? 1 : Math.ceil( ( M - N ) / ( MB - N ) );
	Tref = new Float64Array( NB * numblk * N );
	lwk1 = NB * N;
	WK1 = new Float64Array( lwk1 );
	dlatsqr( M, N, MB, NB, Aref, 1, M, 0, Tref, 1, NB, 0, WK1, 1, 0 );

	nblocal = ( NB < N ) ? NB : N;
	lwork = Math.max( 1, nblocal * Math.max( nblocal, N - nblocal ) );
	WORK = new Float64Array( lwork );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var A;
		var T;
		var i;
		var k;

		A = new Float64Array( M * N );
		T = new Float64Array( NB * numblk * N );

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			for ( k = 0; k < M * N; k++ ) {
				A[ k ] = Aref[ k ];
			}
			for ( k = 0; k < NB * numblk * N; k++ ) {
				T[ k ] = Tref[ k ];
			}
			info = dorgtsqr_row( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, WORK, 1, 0 ); // eslint-disable-line max-len
			if ( info !== 0 ) {
				b.fail( 'should return 0' );
			}
		}
		b.toc();
		if ( info !== 0 ) {
			b.fail( 'should return 0' );
		}
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	var max;
	var min;
	var M;
	var N;
	var f;
	var i;

	min = 4;
	max = 7;

	for ( i = min; i <= max; i++ ) {
		N = pow( 2, i );
		M = N * 4;
		f = createBenchmark( M, N, 2 * N, N >> 1 );
		bench( format( '%s:ndarray:M=%d,N=%d,MB=%d,NB=%d', pkg, M, N, 2 * N, N >> 1 ), f );
	}
}

main();
