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

'use strict';

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pkg from './../package.json' with { type: 'json' };
import dsband from './../lib/index.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - order of the problem
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	const nev = 4;
	const ncv = 10;
	const lda = 4;
	const kl = 1;
	const ku = 1;
	const idiag = kl + ku + 1;
	const isup = kl + ku;
	const isub = kl + ku + 2;
	const AB = new Float64Array( lda * N );
	const MB = new Float64Array( lda * N );
	const h = 1.0 / ( N + 1 );
	const r1 = 4.0 / 6.0;
	const r2 = 1.0 / 6.0;
	let j;
	for ( j = 1; j <= N; j++ ) {
		AB[ ( idiag-1 ) + ( (j-1)*lda ) ] = 2.0 / h;
		MB[ ( idiag-1 ) + ( (j-1)*lda ) ] = r1 * h;
	}
	for ( j = 1; j <= N-1; j++ ) {
		AB[ ( isup-1 ) + ( j*lda ) ] = -1.0 / h;
		AB[ ( isub-1 ) + ( (j-1)*lda ) ] = -1.0 / h;
		MB[ ( isup-1 ) + ( j*lda ) ] = r2 * h;
		MB[ ( isub-1 ) + ( (j-1)*lda ) ] = r2 * h;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let iparam, select, resid, iwork, workl, workd, RFAC, info, d, V, r, i;

		const lworkl = ( ncv * ncv ) + ( 8 * ncv );
		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			RFAC = new Float64Array( lda * N );
			V = new Float64Array( N * ncv );
			d = new Float64Array( ncv );
			resid = new Float64Array( N );
			for ( r = 0; r < N; r++ ) {
				resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
			}
			workd = new Float64Array( 3 * N );
			workl = new Float64Array( lworkl );
			iparam = new Int32Array( 11 );
			iparam[ 2 ] = 300;
			iparam[ 6 ] = 3;
			iwork = new Int32Array( N );
			select = new Int32Array( ncv );
			info = dsband( true, 'all', select, d, V, N, 0.0, N, AB, MB, lda, RFAC, kl, ku, 'LM', 'generalized', nev, 0.0, resid, ncv, V, N, iparam, workd, workl, lworkl, iwork, 1 );
			if ( info !== 0 || isnan( d[ 0 ] ) ) {
				b.fail( 'should converge' );
			}
		}
		b.toc();
		if ( isnan( d[ 0 ] ) ) {
			b.fail( 'should not return NaN' );
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
	let i, N;
	for ( i = 4; i <= 8; i++ ) {
		N = pow( 2, i );
		bench( pkg.name + ':size=' + N, createBenchmark( N ) );
	}
}

main();
