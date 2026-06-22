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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import ztzrzf from './../lib/ztzrzf.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} M - matrix row dimension; the routine factors an `M`-by-`(2*M)` complex upper trapezoidal matrix
* @returns {Function} benchmark function
*/
function createBenchmark( M ) {
	var workTpl;
	var TAUtpl;
	var Atpl;
	var work;
	var TAU;
	var A;
	var N;
	var v;
	var i;

	N = 2 * M;
	Atpl = new Complex128Array( M * N );
	v = reinterpret( Atpl, 0 );
	for ( i = 0; i < 2 * M * N; i++ ) {
		v[ i ] = ( ( i % 7 ) - 3 ) * 0.25;
	}
	TAUtpl = new Complex128Array( M );
	workTpl = new Complex128Array( M * 32 );

	A = new Complex128Array( M * N );
	TAU = new Complex128Array( M );
	work = new Complex128Array( M * 32 );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var y;
		var k;

		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			A.set( Atpl );
			TAU.set( TAUtpl );
			work.set( workTpl );
			y = ztzrzf( 'column-major', M, N, A, M, TAU, 1, work, 1 );
			if ( isnan( y ) ) {
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
		bench( format( '%s:M=%d', pkg, M ), f );
	}
}

main();
