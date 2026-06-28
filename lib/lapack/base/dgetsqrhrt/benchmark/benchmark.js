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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dgetsqrhrt from './../lib/dgetsqrhrt.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - column count (matrix is `(2N)`-by-`N`)
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var numAllRowBlocks;
	var nb1local;
	var nb2local;
	var lwork;
	var WORK;
	var mb1;
	var nb1;
	var nb2;
	var lwt;
	var lw2;
	var M;
	var A;
	var T;

	M = 2 * N;
	mb1 = N + 4;
	nb1 = ( N >= 8 ) ? 8 : N;
	nb2 = ( N >= 4 ) ? 4 : N;
	nb1local = ( nb1 < N ) ? nb1 : N;
	nb2local = ( nb2 < N ) ? nb2 : N;
	numAllRowBlocks = Math.max( 1, Math.ceil( ( M - N ) / ( mb1 - N ) ) );
	lwt = numAllRowBlocks * N * nb1local;
	lw2 = nb1local * Math.max( nb1local, N - nb1local );
	lwork = lwt + ( N * N ) + Math.max( lw2, N );
	A = uniform( M * N, -1.0, 1.0, options );
	T = new Float64Array( nb2local * N );
	WORK = new Float64Array( lwork );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			A[ 0 ] += 1.0;
			y = dgetsqrhrt( 'column-major', M, N, mb1, nb1, nb2, A, M, T, ( ( nb2 < N ) ? nb2 : N ), WORK );
			if ( isnan( y ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y ) ) {
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
	var min;
	var max;
	var N;
	var f;
	var i;

	min = 1; // 2^min
	max = 6; // 2^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 2, i );
		f = createBenchmark( N );
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
