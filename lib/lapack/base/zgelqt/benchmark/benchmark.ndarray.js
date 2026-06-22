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
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zgelqt from './../lib/ndarray.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};
var MB = 8;


// FUNCTIONS //

/**
* Fills a `Complex128Array` of length `n` with uniformly distributed real and imaginary parts.
*
* @private
* @param {NonNegativeInteger} n - number of complex elements
* @returns {Complex128Array} filled array
*/
function fillComplex( n ) {
	var view;
	var raw;
	var out;
	var i;
	raw = uniform( 2 * n, -10.0, 10.0, options );
	out = new Complex128Array( n );
	view = reinterpret( out, 0 );
	for ( i = 0; i < 2 * n; i++ ) {
		view[ i ] = raw[ i ];
	}
	return out;
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - matrix dimension
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	var WORK;
	var N;
	var A;
	var T;

	N = len;
	A = fillComplex( N * N );
	T = fillComplex( MB * N );
	WORK = fillComplex( MB * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var info;
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			info = zgelqt( N, N, MB, A, 1, N, 0, T, 1, MB, 0, WORK, 0 );
			if ( isnan( info ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( info ) ) {
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1; // 10^min
	max = 2; // 10^max -- N=100; A is N*N = 1e4; safe.

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
