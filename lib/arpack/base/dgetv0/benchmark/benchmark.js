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
import dgetv0 from './../lib/index.js';


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - order of the problem
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var V = new Float64Array( N );
	var resid = new Float64Array( N );
	var workd = new Float64Array( 2*N );
	var rnorm = new Float64Array( 1 );
	var ipntr = new Int32Array( 3 );
	var ido = new Int32Array( 1 );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var state;
		var guard;
		var i;
		var r;
		var p;
		var q;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			state = {};
			ido[ 0 ] = 0;
			guard = 0;
			while ( guard++ < 100 ) {
				dgetv0( state, ido, 'standard', 1, false, N, 1, V, N, resid, rnorm, ipntr, workd );
				if ( ido[ 0 ] === 99 ) {
					break;
				}
				p = ipntr[ 0 ];
				q = ipntr[ 1 ];
				for ( r = 0; r < N; r++ ) {
					// OP = 2*I (a trivial operator, sufficient for timing):
					workd[ q + r ] = 2.0 * workd[ p + r ];
				}
			}
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
	var min = 1;
	var max = 6;
	var N;
	var i;
	for ( i = min; i <= max; i++ ) {
		N = pow( 2, i );
		bench( pkg.name + ':size=' + N, createBenchmark( N ) );
	}
}

main();
