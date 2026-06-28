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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zsytrfrk from './../lib/ndarray.js';


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
	var v;
	var i;

	// Build a deterministic complex symmetric matrix with diagonally dominant diagonal for numerical stability.
	Aref = new Complex128Array( N * N );
	v = reinterpret( Aref, 0 );
	for ( i = 0; i < N * N; i += 1 ) {
		v[ 2 * i ] = Math.sin( i * 0.13 );
		v[ ( 2 * i ) + 1 ] = 0.1 * Math.cos( i * 0.07 );
	}
	for ( i = 0; i < N; i += 1 ) {
		v[ 2 * ( ( i * N ) + i ) ] = N + 1.0;
		v[ ( 2 * ( ( i * N ) + i ) ) + 1 ] = 0.0;
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
		for ( k = 0; k < b.iterations; k += 1 ) {
			A = new Complex128Array( Aref.buffer.slice( 0 ) );
			e = new Complex128Array( N );
			IPIV = new Int32Array( N );
			y = zsytrfrk( 'lower', N, A, 1, N, 0, e, 1, 0, IPIV, 1, 0 );
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

	for ( i = min; i <= max; i += 1 ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
