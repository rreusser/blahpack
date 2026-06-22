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

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zhetrfrk from './../lib/zhetrf_rk.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var Aref;
	var idx;
	var i;
	var j;

	// Build a Hermitian matrix (lower triangle stored), diagonally dominant for stability.
	Aref = new Complex128Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			idx = ( ( j * N ) + i ) * 2;
			Aref[ idx ] = Math.sin( ( i + 1 ) * 0.7 ) * Math.cos( ( j + 1 ) * 0.3 );
			Aref[ idx + 1 ] = ( i === j ) ? 0.0 : 0.2 * Math.sin( ( i - j ) * 0.21 );
		}
		idx = ( ( j * N ) + j ) * 2;
		Aref[ idx ] = N + 1.0;
		Aref[ idx + 1 ] = 0.0;
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var IPIV;
		var A;
		var e;
		var y;
		var k;

		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			A = new Complex128Array( Aref );
			e = new Complex128Array( N );
			IPIV = new Int32Array( N );
			y = zhetrfrk( 'column-major', 'lower', N, A, N, e, 1, IPIV, 1 );
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

	min = 1; // 10^min
	max = 2; // 10^max — N=100 is enough to exercise the blocked path; N=1000 is too slow for routine benchmarking

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
