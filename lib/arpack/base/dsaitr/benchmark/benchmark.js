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
import dsaitr from './../lib/index.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - order of the problem
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	const np = 3;
	const resid0 = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		resid0[ i ] = 1.0 + ( 0.1 * i );
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let resid, rnorm, state, workd, ipntr, ido, V, H, s, r, j;

		b.tic();
		for ( j = 0; j < b.iterations; j++ ) {
			resid = new Float64Array( resid0 );
			s = 0.0;
			for ( r = 0; r < N; r++ ) {
				s += resid[ r ] * resid[ r ];
			}
			rnorm = new Float64Array( [ Math.sqrt( s ) ] );
			V = new Float64Array( N * np );
			H = new Float64Array( np * 2 );
			workd = new Float64Array( 3 * N );
			ipntr = new Int32Array( 3 );
			ido = new Int32Array( 1 );
			state = {};
			for ( r = 0; r < N; r++ ) {
				workd[ r ] = resid[ r ];
			}
			do {
				dsaitr( state, ido, 'standard', N, 0, np, 1, resid, rnorm, V, N, H, np, ipntr, workd );
				if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 || ido[ 0 ] === 2 ) {
					for ( r = 0; r < N; r++ ) {
						workd[ ipntr[ 1 ] + r ] = 2.0 * workd[ ipntr[ 0 ] + r ];
					}
				}
			} while ( ido[ 0 ] !== 99 );
			if ( isnan( rnorm[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( rnorm[ 0 ] ) ) {
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
	for ( i = 2; i <= 6; i++ ) {
		N = pow( 2, i );
		bench( pkg.name + ':size=' + N, createBenchmark( N ) );
	}
}

main();
