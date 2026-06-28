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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import ztpmlqt from './../lib/ndarray.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};
var MB = 32;


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix dimension (square problem with M=N=K, L=N/2)
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var WORK;
	var mb;
	var V;
	var T;
	var A;
	var B;
	var l;

	mb = ( MB < N ) ? MB : N;
	l = ( N / 2 ) | 0;
	V = new Complex128Array( uniform( 2 * N * N, -1.0, 1.0, options ).buffer );
	T = new Complex128Array( uniform( 2 * mb * N, -1.0, 1.0, options ).buffer );
	A = new Complex128Array( uniform( 2 * N * N, -1.0, 1.0, options ).buffer );
	B = new Complex128Array( uniform( 2 * N * N, -1.0, 1.0, options ).buffer );
	WORK = new Complex128Array( N * mb );
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
			y = ztpmlqt( 'left', 'no-transpose', N, N, N, l, mb, V, 1, N, 0, T, 1, mb, 0, A, 1, N, 0, B, 1, N, 0, WORK, 1, 0 );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1;
	max = 2;

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:N=%d', pkg, len ), f );
	}
}

main();
