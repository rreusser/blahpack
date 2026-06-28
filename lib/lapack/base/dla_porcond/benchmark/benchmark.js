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

/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dla_porcond from './../lib/dla_porcond.js';


// VARIABLES //

var options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} len - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	var IWORK;
	var WORK;
	var AF;
	var N;
	var A;
	var C;
	var i;

	N = len;

	// Create a diagonally dominant SPD matrix:
	A = uniform( N * N, -1.0, 1.0, options );
	for ( i = 0; i < N; i++ ) {
		A[ ( i * N ) + i ] = N + 1.0;
	}
	AF = new Float64Array( A ); // eslint-disable-line stdlib/require-globals
	dpotrf( 'upper', N, AF, 1, N, 0 );
	C = uniform( N, 0.1, 10.0, options );
	WORK = new Float64Array( 3 * N ); // eslint-disable-line stdlib/require-globals
	IWORK = new Int32Array( N );
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
			y = dla_porcond( 'column-major', 'upper', N, A, N, AF, N, 1, C, 1, WORK, 1, IWORK, 1, 0 ); // eslint-disable-line max-len
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

	min = 1; // 10^min
	max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
