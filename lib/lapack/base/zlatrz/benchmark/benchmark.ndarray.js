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
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} M - number of rows of A
* @returns {Function} benchmark function
*/
function createBenchmark( M ) {
	var Complex128Array2;
	var workTpl;
	var TAUtpl;
	var Atpl;
	var work;
	var TAU;
	var v;
	var A;
	var N;
	var l;
	var i;

	// Use M-by-(2*M) (l = M):
	N = 2 * M;
	l = M;
	Complex128Array2 = Complex128Array;

	Atpl = new Complex128Array2( M * N );
	v = reinterpret( Atpl, 0 );
	for ( i = 0; i < 2 * M * N; i++ ) {
		v[ i ] = ( ( i % 7 ) - 3 ) * 0.25;
	}
	TAUtpl = new Complex128Array2( M );
	workTpl = new Complex128Array2( M );

	A = new Complex128Array2( M * N );
	TAU = new Complex128Array2( M );
	work = new Complex128Array2( M );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var out;
		var k;

		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			A.set( Atpl );
			TAU.set( TAUtpl );
			work.set( workTpl );
			out = ndarray( M, N, l, A, 1, M, 0, TAU, 1, 0, work, 1, 0 );
			if ( isnan( reinterpret( out, 0 )[ 0 ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
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
	var M;
	var f;
	var i;

	min = 1; // 10^min
	max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		M = pow( 10, i );
		f = createBenchmark( M );
		bench( format( '%s:ndarray:M=%d', pkg, M ), f );
	}
}

main();
