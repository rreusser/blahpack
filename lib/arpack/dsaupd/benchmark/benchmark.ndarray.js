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
import dsaupd from './../lib/index.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - order of the problem
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	const nev = 2;
	const ncv = 5;
	const A = new Float64Array( N * N );
	const resid0 = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		A[ i + ( i * N ) ] = 2.0;
		if ( i < N - 1 ) {
			A[ i + ( ( i + 1 ) * N ) ] = -1.0;
			A[ ( i + 1 ) + ( i * N ) ] = -1.0;
		}
		resid0[ i ] = 1.0 + ( 0.1 * ( i + 1 ) );
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let iparam, resid, state, workl, workd, ipntr, info, ido, acc, V, p, q;
		let r, c, j;

		const lworkl = ( ncv * ncv ) + ( 8 * ncv );
		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			resid = new Float64Array( resid0 );
			V = new Float64Array( N * ncv );
			workd = new Float64Array( 3 * N );
			workl = new Float64Array( lworkl );
			iparam = new Int32Array( 11 );
			iparam[ 0 ] = 1;
			iparam[ 2 ] = 100;
			iparam[ 6 ] = 1;
			ipntr = new Int32Array( 11 );
			ido = new Int32Array( 1 );
			state = {};
			info = 1;
			do {
				info = dsaupd.ndarray( state, ido, 'standard', N, 'LM', nev, 0.0, resid, 1, 0, ncv, V, 1, N, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, info );
				if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
					p = ipntr[ 0 ];
					q = ipntr[ 1 ];
					for ( r = 0; r < N; r++ ) {
						acc = 0.0;
						for ( c = 0; c < N; c++ ) {
							acc += A[ r + ( c * N ) ] * workd[ p + c ];
						}
						workd[ q + r ] = acc;
					}
				}
			} while ( ido[ 0 ] !== 99 );
			if ( isnan( workl[ ipntr[ 5 ] - 1 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( workl[ ipntr[ 5 ] - 1 ] ) ) {
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
	for ( i = 3; i <= 7; i++ ) {
		N = pow( 2, i );
		bench( pkg.name + ':size=' + N, createBenchmark( N ) );
	}
}

main();
